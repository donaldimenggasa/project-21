import React from 'react';
import { CodeEditor } from '~/components/codeEditor';

interface BindableConfigProps {
  value: string;
  onChange: (value: string) => void;
}

function BindableConfig({ value, onChange }: BindableConfigProps) {
  return (
    <CodeEditor
      value={value}
      onChange={onChange}
    />
  );
}

export default BindableConfig;