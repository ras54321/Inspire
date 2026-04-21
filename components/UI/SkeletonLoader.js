import React from 'react';

const SkeletonLoader = ({ type = 'post', count = 1 }) => {
  if (type === 'post') {
    return (
      <div className="space-y-4">
        {Array(count).fill(0).map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full mr-3"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            <div className="flex items-center space-x-4 mt-4 border-t pt-4">
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'user') {
    return (
      <div className="space-y-4">
        {Array(count).fill(0).map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full mr-4"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-3"></div>
                <div className="flex space-x-4">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                </div>
              </div>
              <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'comment') {
    return (
      <div className="space-y-3">
        {Array(count).fill(0).map((_, index) => (
          <div key={index} className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg animate-pulse">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default SkeletonLoader;
