// src/components/ui/ErrorMessage.jsx
import React from 'react';

function ErrorMessage({ message = 'Ocorreu um erro inesperado.' }) {
    return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Erro:</strong>
            <span className="block sm:inline ml-2">{message}</span>
        </div>
    );
}

export default ErrorMessage;