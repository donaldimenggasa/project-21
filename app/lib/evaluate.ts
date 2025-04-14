import * as espree from 'espree';
import * as Papa from "papaparse";
import moment from "moment";
import * as uuid from "uuid";
import numbro from "numbro";
import _ from "lodash";
import * as estraverse from 'estraverse';
import { MemberExpression, Node as ESTreeNode, Comment, Program } from 'estree';
import lodash from 'lodash';
const {last} = lodash;




export const ds = (id: string): string[] => id.split('.');
export const JSON_LIKE_REGEX = /^{[^{]([\s\S]+?}?)}$/g
export const OBJECT_REGEX = /^{{([\s\S]+?)}}$/g
export const ARRAY_LIKE_REGEX = /^\[([\s\S]+?}?)\]$/g
export const ANY_TEMPLATE_REGEX = /{{([\s\S]+?}?)}}/g
// Valid javascript identifiers
export const VALID_JS_IDENTIFIER_REGEX = /^[$A-Z_][0-9A-Z_$]*$/i
export const EMPTY_TEMPLATE_REGEX = /^\s*\{\{\s*\}\}\s*$/
export const FIRST_TEMPLATE_REGEX = /{{([\s\S]+?}?)}}/
export const ONLY_TEMPLATE_REGEX = /^{{([\s\S]+?}?)}}$/
export const SEMVER_REGEX = /^(\d+)\.(\d+)\.(\d+)$/g
export const URL_REGEX = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/
export const VALID_JS_IDENTIFIER_OR_PERIODS_OR_BRACKETS_OR_STRING_OR_BASIC_OP_REGEX = /^\{\{[0-9A-Z_$'" \/\*\-\+\!\:\>\<\&\|\?\.\[\]]*\}\}$/i



export default class CachedGetUndeclaredContext {
  #cachedNodeIsNumberIndex = new Map()

  getMemberExpressionName(expression: MemberExpression): string | undefined {
    const { object } = expression;
    if (object.type === 'Identifier') {
      return object.name;
    }
    return undefined;
  }

  shouldExtendLastIdentifier(
    parent: MemberExpression, 
    lastPieceId: string | undefined
  ): boolean {
    // if the parent is a member expression, we check if the last part of the member expression matches
    // our last piece id, e.g. if parent is abc.def and our last piece is also def
    if (parent.type !== 'MemberExpression') {
      return false;
    }
    if (this.getMemberExpressionName(parent) === lastPieceId) {
      return true;
    }
    const { object } = parent;
    return (
      !!object &&
      object.type === 'MemberExpression' &&
      !!object.object &&
      (
        (object.property.type === 'Identifier' && object.property.name === lastPieceId) ||
        // Also cover the case where the object is a literal, like abc['def']
        (object.property.type === 'Literal' && '' + object.property.value === lastPieceId) ||
        // also cover the case where the object is a number index
        (lastPieceId === '__RETOOL_NUMBER_INDEX__' && this.nodeIsNumberIndex(object.property))
      )
    );
  }

  nodeIsNumberIndex(node: ASTNode): boolean {
    // This function should be cached because it may be called multiple times and some of the calls can be expensive
    // since it needs to recursively check for binary expressions.
    const cached = this.#cachedNodeIsNumberIndex.get(node);
    if (cached != null) {
      return cached;
    }
    const result = (() => {
      // a node is considered a number index if it
      // 1. is i or a number
      // 2. is in the form of ri[...], or
      // 3. is in the form of a binary expression involving only number index
      // Note that this may not cover all cases but is probably sufficient for majority of cases
      switch (node.type) {
        case 'Literal':
          if (typeof (node as LiteralNode).value === 'number') {
            return true;
          } else if (typeof (node as LiteralNode).value === 'string') {
            return /^[0-9]+$/.test(String((node as LiteralNode).value));
          }
          return false;
        case 'Identifier':
          return (node as IdentifierNode).name === 'i';
        case 'MemberExpression':
          return (
            (node as MemberExpressionNode).computed &&
            (node as MemberExpressionNode).object.type === 'Identifier' &&
            (node as MemberExpressionNode).object.name === 'ri'
          );
        case 'BinaryExpression':
          return (
            this.nodeIsNumberIndex((node as ASTNode).left) &&
            this.nodeIsNumberIndex((node as ASTNode).right)
          );
        default:
          return false;
      }
    })();
    this.#cachedNodeIsNumberIndex.set(node, result);
    return result;
  }
}






export const isSingleObjectString = (v: string): boolean => {
  const templateMatches: RegExpMatchArray | null = v.match(ANY_TEMPLATE_REGEX)
  if (templateMatches) {
    if (templateMatches.length > 1) {
      return false
    }
  }
  return !!v.match(OBJECT_REGEX)
}





function removeAllOccurrences(list: string[], id: string): string[] {
  // #removeAllOccurrences
  // NOTE: the usage of this function is somewhat questionable. E.g. it results in a.b + a.b.c only outputting
  // ['a.b.c'] while a.b.c + a.b outputting ['a.b.c', 'a.b'] though changing it now seems risky
  // TODO: remove this function
  return list.filter((v: string) => v !== id);
}




function removeLastOccurence(list: string[], id: string): string[] {
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i] === id) {
      list.splice(i, 1);
      return list;
    }
  }
  return list;
}



function notProperty(node: { type: string }): boolean {
  return (
    node.type !== 'MethodDefinition' &&
    node.type !== 'Property' &&
    node.type !== 'PropertyDefinition' &&
    node.type !== 'LabeledStatement'
  );
}



function isNumberIndex(id: string | undefined): boolean {
  return id === 'i' || id === '__RETOOL_NUMBER_INDEX__' || (id && !isNaN(parseInt(id, 10)));
}




interface ASTNode {
  type: string;
  [key: string]: any;
}

interface FunctionNode extends ASTNode {
  id?: { name: string };
  params: ASTNode[];
}

interface IdentifierNode extends ASTNode {
  name: string;
}

interface LiteralNode extends ASTNode {
  value: string | number;
}

interface MemberExpressionNode extends ASTNode {
  object: ASTNode;
  property: ASTNode;
  computed: boolean;
}

interface CallExpressionNode extends ASTNode {
  callee: ASTNode;
  arguments: ASTNode[];
}

interface VisitorOption {
  Skip: string;
}

const getUndeclaredIdentifiers = (
  ast: ASTNode,
  declared: Set<string> = new Set(),
  undeclared: Set<string> = new Set()
): Set<string> => {
  let identifiers: string[] = [];
  const astFns: FunctionNode[] = [];

  let lastFoundIdentifier: string | null = null;

  const cachedContext = new CachedGetUndeclaredContext();

  estraverse.traverse(ast as unknown as ESTreeNode, {
    enter: (node: ASTNode, parent: ASTNode | null): void => {
      if (parent != null) {
        if (parent.type !== 'MemberExpression') {
          lastFoundIdentifier = null;
        }

        const lastPieceId = last(lastFoundIdentifier?.split('.'));

        if (
          node.type === 'Literal' &&
          cachedContext.shouldExtendLastIdentifier(
            { ...parent, optional: false } as MemberExpression,
            lastPieceId
          ) &&
          (cachedContext.getMemberExpressionName(
            { ...parent, optional: false } as MemberExpression
          ) === lastPieceId || isNumberIndex(lastPieceId)) &&
          lastFoundIdentifier &&
          (typeof (node as LiteralNode).value === 'string' ||
            typeof (node as LiteralNode).value === 'number')
        ) {
          identifiers = removeAllOccurrences(identifiers, lastFoundIdentifier);
          lastFoundIdentifier += '.';
          lastFoundIdentifier += (node as LiteralNode).value;
          identifiers.push(lastFoundIdentifier);
        } else if (node.type === 'Identifier') {
          if (parent.type === 'VariableDeclarator') {
            declared.add((node as IdentifierNode).name);
          } else if (
            notProperty(parent) &&
            (parent.type !== 'MemberExpression' ||
              (parent as MemberExpressionNode).property.type !== 'Identifier' ||
              (node as IdentifierNode).name !==
                ((parent as MemberExpressionNode).property as IdentifierNode)
                  .name)
          ) {
            identifiers.push((node as IdentifierNode).name);
            lastFoundIdentifier = (node as IdentifierNode).name;
          } else if (
            parent.type === 'Property' &&
            (parent as any).key !== node
          ) {
            identifiers.push((node as IdentifierNode).name);
            lastFoundIdentifier = (node as IdentifierNode).name;
          } else if (
            cachedContext.shouldExtendLastIdentifier(
              { ...parent, optional: false } as MemberExpression,
              lastPieceId
            )
          ) {
            if (lastFoundIdentifier != null) {
              identifiers = removeAllOccurrences(
                identifiers,
                lastFoundIdentifier
              );
            }
            if (lastFoundIdentifier) {
              lastFoundIdentifier += '.';
              lastFoundIdentifier += (node as IdentifierNode).name;
            } else {
              lastFoundIdentifier = (node as IdentifierNode).name;
            }
            identifiers.push(lastFoundIdentifier);
          }
        } else if (
          parent.type === 'MemberExpression' &&
          (parent as MemberExpressionNode).computed &&
          lastFoundIdentifier &&
          cachedContext.shouldExtendLastIdentifier(
            { ...parent, optional: false } as MemberExpression,
            lastPieceId
          ) &&
          (cachedContext.getMemberExpressionName(
            { ...parent, optional: false } as MemberExpression
          ) === lastPieceId || isNumberIndex(lastPieceId)) &&
          cachedContext.nodeIsNumberIndex(node)
        ) {
          if (lastFoundIdentifier != null) {
            identifiers = removeLastOccurence(identifiers, lastFoundIdentifier);
          }
          lastFoundIdentifier += '.';
          lastFoundIdentifier += '__RETOOL_NUMBER_INDEX__';
          identifiers.push(lastFoundIdentifier);
          estraverse.VisitorOption.Skip;
        } else if (
          node.type === 'FunctionDeclaration' ||
          node.type === 'FunctionExpression' ||
          node.type === 'ArrowFunctionExpression'
        ) {
          astFns.push(node as FunctionNode);
          if (
            (node.type === 'FunctionDeclaration' ||
              node.type === 'FunctionExpression') &&
            (node as FunctionNode).id != null
          ) {
            declared.add((node as FunctionNode).id!.name);
          }
          (estraverse.VisitorOption as unknown as VisitorOption).Skip;
        }
      }
    },
    leave: (node: ASTNode) => {
      if (node.type === 'CallExpression') {
        const namedArgs = (node as CallExpressionNode).arguments
          .map((a: ASTNode) => a.type)
          .filter(
            (t: string) =>
              t !== 'FunctionExpression' &&
              t !== 'Literal' &&
              t !== 'ArrowFunctionExpression'
          );
        const lastId =
          identifiers[identifiers.length - namedArgs.length - 1];
        const lastIdCmps = lastId?.split('.');
        if (
          lastId &&
          (node as CallExpressionNode).callee.type === 'MemberExpression' &&
          (node as CallExpressionNode).callee.property.type === 'Identifier' &&
          (node as CallExpressionNode).callee.property.name ===
            last(lastIdCmps)
        ) {
          identifiers = removeLastOccurence(identifiers, lastId);
          const strippedId = lastIdCmps.slice(0, -1).join('.');
          if (strippedId) {
            identifiers.push(strippedId);
          }
        }
      }
    },
  });

  identifiers.forEach((id) => {
    const firstPiece = id.split('.')[0];
    if (!declared.has(firstPiece)) {
      undeclared.add(id);
    }
  });

  astFns.forEach((astFn) => {
    const declaredCopy = new Set<string>();
    declared.forEach((id) => {
      declaredCopy.add(id);
    });
    astFn.params.forEach((param: ASTNode) => {
      switch (param.type) {
        case 'ArrayPattern':
        case 'AssignmentPattern':
        case 'RestElement':
        case 'MemberExpression':
        case 'ObjectPattern':
          break;
        case 'Identifier':
          declaredCopy.add((param as IdentifierNode).name);
          break;
        default:
          const _invalid = param;
      }
    });
    getUndeclaredIdentifiers(astFn, declaredCopy, undeclared);
  });
  return undeclared;
};



export const helperFuncs = {
    moment: moment,
    _,
    // necessary to get tsc to compile
    uuid: uuid,
    Papa,
    formatDataAsArray: () => { },
    formatDataAsObject: () => { },
    numbro: numbro,
};

export const testingFunctions = {
    assertCondition: () => { },
    assertEquals: () => { },
    assertQueryCalled: () => { },
    assertQueryCalledTimes: () => { },
    waitForCondition: () => { },
    mock: () => { },
};

const jsBuiltInFunctions = [
    // default globals
    'eval',
    'uneval',
    'isFinite',
    'isNaN',
    'parseFloat',
    'parseInt',
    'encodeURI',
    'encodeURIComponent',
    'decodeURI',
    'decodeURIComponent',
    'JSON',
    'Number',
    'BigInt',
    'Math',
    'Date',
    'Array',
    'Error',
    'Object',
    'Function',
    'Boolean',
    'Symbol',
    'String',
    'RegExp',
    'Map',
    'Set',
    'WeakMap',
    'WeakSet',
    'Promise',
    // WindowOrWorkerGlobalScope
    'atob',
    'btoa',
    'setInterval',
    'setTimeout',
    'clearInterval',
    'clearTimeout',
    'console',
];


const globalScopeFuncs = new Set(Object.keys({ ...helperFuncs, ...testingFunctions }).concat(jsBuiltInFunctions));




/**
 * Return the AST of the provided expression
 * @param expression Any JS Expression
 * @param options ESPree options
 */
function parseJSExpression(expression: string, options: espree.Options): Program {
  return espree.parse(expression, { ecmaVersion: 11, ...options }) as unknown as Program;
}



interface SelectorOptions {
  code: string;
  reattemptWithParentheses?: boolean;
  ignoredGlobals?: Set<string>;
}

export function getSelectorsInCode(
  code: string, 
  reattemptWithParentheses: boolean = true, 
  ignoredGlobals: Set<string> = globalScopeFuncs
): string[][] {
  let parsed: Program | undefined;
  try {
    parsed = parseJSExpression(code, {});
  } catch (err) {
    if (reattemptWithParentheses) {
      parsed = parseJSExpression(`(${code})`, {});
    }
  }

  const parsedVars: Set<string> = getUndeclaredIdentifiers(parsed as ESTreeNode);
  const vars: string[] = Array.from(parsedVars);
  const varSelectors: string[][] = vars.map((v) => ds(v));

  // The bug that was fixed now correctly returns
  // functions (e.g. moment(a) -> ["moment", "a"])
  // Since a lot of Retool was built on the incorrect behavior
  // of only returning ["a"], we filter any ignoredGlobals
  // to keep the behavior the same (e.g. moment, numbro, etc.)
  // This is most obvious in query library where we don't want
  // {{moment(a)}} to create two inputs: moment and a.
  const varArr: string[][] = varSelectors?.filter((v) => {
    return !ignoredGlobals.has(v[0]);
  });

  return varArr;
}







//=======================================================


function isCallExpression(node: ASTNode): node is CallExpressionNode {
  return node.type === 'CallExpression';
}

interface ObjectExpressionNode extends ASTNode {
  type: 'ObjectExpression';
}

function isObjectExpression(node: ASTNode): node is ObjectExpressionNode {
  return node.type === 'ObjectExpression';
}

interface PropertyNode extends ASTNode {
  type: 'Property';
}

function isPropertyNode(node: ASTNode): node is PropertyNode {
  return node.type === 'Property';
}

interface VariableDeclaratorNode extends ASTNode {
  type: 'VariableDeclarator';
}

function isVariableDeclarator(node: ASTNode): node is VariableDeclaratorNode {
  return node.type === 'VariableDeclarator';
}

function isMemberExpression(node: ASTNode): node is MemberExpressionNode {
  return node.type === 'MemberExpression';
}

function isIdentifier(node: ASTNode): node is IdentifierNode {
  return node.type === 'Identifier';
}


export function triggerPredicate(node: ASTNode, pluginId?: string): boolean {
  if (isCallExpression(node)) {
    if (
      isMemberExpression(node?.callee) &&
      isIdentifier(node.callee.property) &&
      node.callee?.property?.name === 'trigger'
    ) {
      if (!pluginId) {
        return true;
      }
      return isIdentifier(node.callee.object) && node.callee?.object?.name === pluginId;
    }
  }
  return false;
}


export function computeJavascriptDependencies(code : any) {
  // wrap code in function so we can parse `return` correctly
  const wrappedInFunction = `async () => { \n${code}\n }`
  return getSelectorsInCode(wrappedInFunction, false, globalScopeFuncs)
}




export function parseTriggeredQueries(code: string): Set<string> {
  let parsed: Program | undefined;
  try {
    parsed = parseJSExpression(`() => { \n${code}\n }`, {});
  } catch (err) {
    try {
      parsed = parseJSExpression(`async () => {${code}}`, {});
    } catch (e) {}
  }
  const triggeredQueries: Set<string> = new Set();
  estraverse.traverse(parsed as unknown as ESTreeNode, {
    enter: (node: ASTNode): void => {
      if (triggerPredicate(node, undefined)) {
        if (
          isCallExpression(node) &&
          isMemberExpression((node as CallExpressionNode).callee) &&
          isIdentifier((node as CallExpressionNode).callee.object)
        ) {
          triggeredQueries.add((node as CallExpressionNode).callee.object.name);
        }
      }
    },
  });
  return triggeredQueries;
}











export function evaluateFunctionTemplate(
  code: string, 
  scope: Record<string, any>
): any {
  let escapedCode: string = code;
  try {
    // sometimes code includes unnecessary escaping because of nested strings in the template.
    // if there are extra "\\", then this will successfully parse and strip them.
    // otherwise, it will hit the catch clause and we will execute the code as provided
    escapedCode = JSON.parse(`{ "v": "${code}" }`).v;
  } catch (e) {}
  // Extract dependencies
  // const dependencies = getSelectorsInCode(escapedCode);
  // return dependencies;
  // Process dependencies if necessary...
  // You may want to check if the dependencies exist in the scope or do something else
  const compiled = new Function(
    'scope', 
    `with(scope||{}){ return (${escapedCode}) }`
  );
  return compiled(scope);
}





interface ExecuteCodeResult {
  success: boolean;
  data: any;
  message?: string;
}


export const executeCode = async (code: string, scope: Record<string, any>): Promise<ExecuteCodeResult> => {
  let wrappedCode = `with (scope) {${code}}`;
  try {
    const compiled = new Function('scope', wrappedCode);
    const run = await compiled(scope);
    return {
      success: true,
      data: run,
    };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      message: error.message,
    };
  }
};






interface TemplateEvaluatorOptions {
  escape?: boolean;
  dataSourceId?: string;
}

type TemplateEvaluatorStrategy = 'LodashTemplate' | 'FunctionTemplate';

interface TemplateEvaluator {
  (text: string, scope: Record<string, any>, strategy: TemplateEvaluatorStrategy): any;
}

export const createTemplateEvaluator = (options: TemplateEvaluatorOptions): TemplateEvaluator => {
  const evaluator: TemplateEvaluator = (text, scope, strategy) => {
    switch (strategy) {
      case 'LodashTemplate': {
        const lodashTemplateOptions = {
          escape: options?.escape || true ? ANY_TEMPLATE_REGEX : undefined,
          interpolate: ANY_TEMPLATE_REGEX,
        };
        const sdas = _.template(text, lodashTemplateOptions)(scope);
        return sdas;
      }
      case 'FunctionTemplate': {
        const result = evaluateFunctionTemplate(text, scope, options.dataSourceId);

        if (options.escape) {
          if (typeof result === 'string') {
            return result.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          }
        }
        return result;
      }
    }
  };
  return evaluator;
};



export const covertPureJavaScript = (code: string): string => {
  return code.replace(/{{(.*?)}}/g, (match: string, p1: string): string => {
    const keys: string[] = p1.trim().split('.');
    return keys.join('.');
  });
};





export const interpolateCode = (code: string, scope: Record<string, any>): string => {
  console.log('interpolateCode', code, scope);
  return code.replace(/{{(.*?)}}/g, (match: string, p1: string): string => {
    const keys: string[] = p1.trim().split('.');

    // FIX ERROR JSON RESULTS [Object, Object]
    const check_is_object: any = lodash.get(scope, keys.join('.'));
    if (check_is_object && typeof check_is_object === 'object') {
      return JSON.stringify(check_is_object);
    }
    try {
      const evaluator: TemplateEvaluator = createTemplateEvaluator({ escape: true });
      const convertValue: any = evaluator(match, scope, 'LodashTemplate');
      
      if (typeof convertValue === 'object') {
        return JSON.stringify(convertValue);
      }
      return convertValue;
    } catch (e: any) {
      console.error('Error executing code:', e.message);
      return null;
    }
  });
};






const SANDBOX_ADDITIONAL_SCOPE = {
  atob,
  btoa,
 // formatDataAsArray,
 // formatDataAsObject,
  moment,
 // numbro,
  _,
 // Papa,
  uuid,
}


let callbackCount = 0
const callbacks = {}


interface RetoolJSCallback {
  type: '__RETOOL_JS_CALLBACK__';
  callbackId: number;
}

type Argument = string | number | boolean | null | undefined | RetoolJSCallback | Argument[] | Record<string, any>;

function convertArguments(args: Argument[]): Argument[] {
  return args.map(function (arg: Argument): Argument {
    if (typeof arg === 'object') {
      if (arg == null) {
        return arg;
      }
      const mapper = function (field: any): any {
        if (typeof field === 'function') {
          const callbackId = callbackCount++;
          callbacks[callbackId] = field;
          return {
            type: '__RETOOL_JS_CALLBACK__',
            callbackId,
          } as RetoolJSCallback;
        } else {
          return field;
        }
      };

      if (Array.isArray(arg)) {
        return arg.map(mapper);
      } else {
        return _.mapValues(arg, mapper);
      }
    } else {
      return arg;
    }
  });
}



interface PluginVariable {
  [key: string]: any; // Consolidated index signature
}

interface ConvertPluginArgs {
  mainWindow: Window;
  origin: string;
  requestId: number;
  variable: PluginVariable;
  _selector: string[];
}

function convertPlugin(
  mainWindow: Window,
  origin: string,
  requestId: number,
  variable: PluginVariable,
  _selector: string[]
): PluginVariable {
  return _.mapValues(variable, (field: any | string, _: string) => {
    if (field === '__RETOOL_JS_API__') {
      return function (...args: any[]): Promise<any> {
        const convertedArgs = convertArguments(Array.prototype.slice.call(args));

        return new Promise((resolve, reject) => {
          const resolveId = callbackCount++;
          const rejectId = callbackCount++;
          callbacks[resolveId] = resolve;
          callbacks[rejectId] = reject;

          try {
            // eslint-disable-next-line no-console
            console.log('posting back?');
          } catch (err) {
            // eslint-disable-next-line no-console
            console.log(err);
          }
        }).catch((e) => {
          // eslint-disable-next-line no-console
          console.warn(`[evaluate.ts] we caught an error resolving the FUNCTION_CALL promise`, e);
        });
      };
    } else {
      return field;
    }
  });
}



interface Scope {
  [key: string]: any;
}


interface MainWindow extends Window {}

function convertScope(
  mainWindow: MainWindow,
  requestId: number,
  origin: string,
  scope: Scope
): Scope {
  return _.mapValues(scope, (variable: any, variableName: string) => {
    if (
      variableName === 'i' ||
      variable == null ||
      typeof variable !== 'object' ||
      Array.isArray(variable)
    ) {
      return variable;
    }

    // Hacky way to check if it's in a listview
    const inListView = variable.pluginType && variable[0];
    if (inListView) {
      return _.mapValues(variable, (field: any, key: string) => {
        if (key !== 'pluginType') {
          return convertPlugin(mainWindow, origin, requestId, field, [variableName, key]);
        }
        return field;
      });
    } else {
      return convertPlugin(mainWindow, origin, requestId, variable, [variableName]);
    }
  });
}





const Le=/{{([\s\S]*?)}}/gm,Oe=/{{/gm,Te=/}}/gm;
export const containInterpolation = (str) => {
  return typeof str === 'string' && new RegExp(Le).test(str);
}


interface EvaluateJobData {
  evalType: 'jsquery' | 'function' | 'alasql';
  code: string;
  scope: Record<string, any>;
  requestId: number;
  htmlEscapeRetoolExpressions: boolean;
  experimentalEvaluatorCaching?: boolean; // Added property
}

interface EvaluateJobEvent {
  data: {
    data: EvaluateJobData;
  };
  source: Window;
  origin: string;
}

interface EvaluateJobResult {
  result: any;
  error: Error | undefined;
  isSuccess: boolean;
}

export async function evaluateJob(
  e: EvaluateJobEvent,
  jsCompile: (code: string, scope: Record<string, any>) => any
): Promise<EvaluateJobResult> {
  const data = e.data.data;
  const mainWindow = e.source;
  let result: any;
  let error: Error | undefined;

  const htmlEscapeRetoolExpressions = data.htmlEscapeRetoolExpressions;
  const templateEvaluator = createTemplateEvaluator({
    escape: htmlEscapeRetoolExpressions,
  });

  if (data.evalType === 'jsquery') {
    try {
      const scope = convertScope(mainWindow, data.requestId, e.origin, {
        ...data.scope,
        ...SANDBOX_ADDITIONAL_SCOPE,
      });
      if (!jsCompile) {
        throw Error('Need to pass in a compile function for jsquery eval type!');
      }
      result = jsCompile(data.code, scope);
      if (result instanceof Promise) {
        result = await result;
      }
    } catch (err: any) {
      if (result instanceof Promise) {
        result = undefined;
        error = new Error(err);
      } else {
        error = err;
      }
    }
  } else if (data.evalType === 'function') {
    try {
      result = templateEvaluator(
        data.code,
        { ...data.scope, ...SANDBOX_ADDITIONAL_SCOPE },
        'FunctionTemplate'
      );
    } catch (err: any) {
      error = err;
    }
  } else if (data.evalType === 'alasql') {
    try {
      result = /*await alasql.promise(data.query, data.parameters)*/ [];
    } catch (err: any) {
      error = err;
    }
  }

  if (typeof result !== 'string') {
    return { result, error, isSuccess: !error };
  }

  if (containInterpolation(result)) {
    return await templateEval(result, data.scope, executeCode);
  } else {
    return { result, error, isSuccess: !error };
  }
}








// common
function preprocessTemplate(template: string): string {
  if (typeof template !== 'string') return template;
  return template.replace(/{{{/g, '{{ {').replace(/}}}/g, '} }}');
}






interface TemplateEvalScope {
  [key: string]: any;
}

interface TemplateEvalJobData {
  evalType: 'jsquery' | 'function';
  code: string;
  scope: TemplateEvalScope;
  requestId: number;
  htmlEscapeRetoolExpressions: boolean;
  experimentalEvaluatorCaching: boolean;
}

interface TemplateEvalJobEvent {
  data: {
    data: TemplateEvalJobData;
  };
  source: string;
  origin: string;
}

export async function templateEval(
  rawTemplateString: string, 
  scope: TemplateEvalScope, 
  jsCompile: (code: string, scope: TemplateEvalScope) => any
): Promise<EvaluateJobResult | undefined> {
  const templateString: string = preprocessTemplate(rawTemplateString.trim());

  const matchOnce: RegExpMatchArray | null = templateString.match(/{{([\s\S]+?)}}/);
  if (matchOnce && matchOnce[0].length === templateString.length) {
    return await evaluateJob(
      {
        data: {
          data: {
            evalType: 'jsquery', // function
            code: matchOnce[1],
            scope: {
              ...scope,
            },
            requestId: 0,
            htmlEscapeRetoolExpressions: false,
            experimentalEvaluatorCaching: false,
          } as EvaluateJobData,
        } as EvaluateJobEvent['data'],
        source: window as Window,
        origin: '',
      } as EvaluateJobEvent,
      jsCompile as (code: string, scope: TemplateEvalScope) => Promise<any>,
    );
  }
}




interface QueryTemplate {
  [key: string]: string;
}

interface UserParams {
  [key: string]: any[];
}

export async function buildUserParams(
  queryTemplate: QueryTemplate,
  parentData: Record<string, any>,
  jsCompile: (code: string, scope: Record<string, any>) => Promise<any>
): Promise<UserParams> {
  const userParams: UserParams = {};
  for (const [key, value] of Object.entries(queryTemplate)) {
    if (typeof value === 'string') {
      userParams[`${key}Params`] = await buildUserParam(
        value as string, 
        parentData as Record<string, any>, 
        jsCompile as (code: string, scope: Record<string, any>) => Promise<any>
      );
    } else {
      throw new Error(`Expected value to be a string, but received ${typeof value}`);
    }
  }
  return userParams;
}



export async function buildUserParam(
  value: string, 
  parentData: Record<string, any>, 
  jsCompile: (code: string, scope: Record<string, any>) => Promise<any>
): Promise<any[]> {
  if (typeof value !== 'string') {
    return [];
  }

  const parameterTemplates: string[] = [];
  value?.replace(ANY_TEMPLATE_REGEX, (v: string) => {
    parameterTemplates.push(v);
    return '';
  });

  const parameters: any[] = [];
  for (let i = 0; i < parameterTemplates.length; i++) {
    const evaluatedString = await templateEval(parameterTemplates[i], parentData, jsCompile);
    parameters[i] = evaluatedString?.result;
  }
  parameters.length = parameterTemplates.length; // Ensure parameters is an array
  return parameters;
}



