// Report management functions using localStorage

export const reportContent = (reporterAddress, contentId, contentType, reason) => {
  try {
    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    
    const newReport = {
      id: Date.now().toString(),
      reporter: reporterAddress,
      contentId,
      contentType, // 'post', 'comment', 'user', etc.
      reason,
      timestamp: Date.now(),
      status: 'pending', // pending, reviewed, resolved
    };
    
    reports.push(newReport);
    localStorage.setItem('reports', JSON.stringify(reports));
    
    return true;
  } catch (error) {
    console.error('Error submitting report:', error);
    return false;
  }
};

export const getReports = () => {
  try {
    return JSON.parse(localStorage.getItem('reports') || '[]');
  } catch (error) {
    console.error('Error getting reports:', error);
    return [];
  }
};

export const getReportsByContent = (contentId) => {
  try {
    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    return reports.filter(report => report.contentId === contentId);
  } catch (error) {
    console.error('Error getting reports for content:', error);
    return [];
  }
};

export const hasUserReported = (reporterAddress, contentId) => {
  try {
    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    return reports.some(
      report => report.reporter === reporterAddress && report.contentId === contentId
    );
  } catch (error) {
    console.error('Error checking if user reported:', error);
    return false;
  }
};

export const updateReportStatus = (reportId, status) => {
  try {
    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    const reportIndex = reports.findIndex(report => report.id === reportId);
    
    if (reportIndex !== -1) {
      reports[reportIndex].status = status;
      localStorage.setItem('reports', JSON.stringify(reports));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error updating report status:', error);
    return false;
  }
};
