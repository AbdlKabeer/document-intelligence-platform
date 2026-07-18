import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const TaxReviewDocument = ({ content }) => {
  const components = {
    // Previous components remain the same
    h1: ({ children }) => (
      <h1 className="text-2xl font-bold text-gray-900 mb-6 mt-8">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl font-semibold text-gray-800 mb-4 mt-6">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-medium text-gray-700 mb-3 mt-4">{children}</h3>
    ),
    p: ({ children }) => (
      <p className="text-gray-600 mb-4 leading-relaxed">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-6 mb-4 text-gray-600 space-y-2">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="leading-relaxed">{children}</li>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-gray-900">{children}</strong>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-200 pl-4 py-2 mb-4 italic text-gray-600">
        {children}
      </blockquote>
    ),
    // Enhanced table components
    table: ({ children }) => (
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-gray-50">{children}</thead>
    ),
    tbody: ({ children }) => (
      <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
    ),
    tr: ({ children, isHeader }) => (
      <tr className={isHeader ? "bg-gray-50" : "hover:bg-gray-50"}>{children}</tr>
    ),
    th: ({ children }) => (
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-t border-gray-200">
        {children}
      </td>
    ),
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
      <div className="prose prose-gray max-w-none">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]} 
          components={components}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default TaxReviewDocument;