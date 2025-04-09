import crypto from "crypto";

const verify = async(request, context, jsonData) =>{
  const { current_user } = context;
  const publicKey = current_user.publicKey;
  //console.log(publicKey)
  if(!publicKey){
    return false;
  }

  const bodyString = JSON.stringify(jsonData);
  const signature = request.headers.get('x-signature');
  const timestamp = request.headers.get('x-timestamp');
  const stringToSign = `${timestamp}.${bodyString}`;
  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(stringToSign);
  verifier.end();
  const isValid = verifier.verify({key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING}, signature, 'base64');
  //console.log('signature valid:', isValid);
  return isValid;
}

export default verify