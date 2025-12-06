
import React from 'react';
import DevStudio from './DevStudio';

interface CodeOSProps {
    onShare: (options: any) => void;
}

const CodeOS: React.FC<CodeOSProps> = ({ onShare }) => {
    return <DevStudio onShare={onShare} />;
};

export default CodeOS;
