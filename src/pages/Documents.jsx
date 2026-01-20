import React from 'react';

const Documents = () => {
  const documents = [
    { name: 'Project Proposal.pdf', size: '2.4 MB', date: '2 days ago', type: 'PDF' },
    { name: 'Team Guidelines.docx', size: '1.2 MB', date: '5 days ago', type: 'DOC' },
    { name: 'Budget 2024.xlsx', size: '856 KB', date: '1 week ago', type: 'XLS' },
    { name: 'Presentation.pptx', size: '5.3 MB', date: '2 weeks ago', type: 'PPT' },
  ];

  const getTypeColor = (type) => {
    switch (type) {
      case 'PDF':
        return 'bg-red-100 text-red-700';
      case 'DOC':
        return 'bg-blue-100 text-blue-700';
      case 'XLS':
        return 'bg-green-100 text-green-700';
      case 'PPT':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm">Portal / Documents</p>
          <h1 className="text-3xl font-bold text-gray-800 mt-1">Documents</h1>
        </div>
        <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition">
          + Upload File
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc, idx) => (
          <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getTypeColor(doc.type)}`}>
                <span className="font-bold text-sm">{doc.type}</span>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">{doc.name}</h3>
            <div className="flex justify-between text-sm text-gray-500">
              <span>{doc.size}</span>
              <span>{doc.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Documents;
