document.addEventListener('DOMContentLoaded', () => {
  const saveButton = document.getElementById('saveButton');
  const serviceNowUrlInput = document.getElementById('serviceNowUrl');

  // Load the current URL from storage
  chrome.storage.sync.get(['baseServiceNowUrl'], (result) => {
    if (result.baseServiceNowUrl) {
      serviceNowUrlInput.value = result.baseServiceNowUrl;
    }
  });

  // Save the URL to storage
  saveButton.addEventListener('click', () => {
    const baseServiceNowUrl = serviceNowUrlInput.value.trim();
    if (baseServiceNowUrl) {
      chrome.storage.sync.set({ baseServiceNowUrl }, () => {
        console.log('ServiceNow URL saved:', baseServiceNowUrl);
      });
    }
  });
});