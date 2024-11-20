document.addEventListener("DOMContentLoaded", () => {
  const saveButton = document.getElementById("saveButton");
  const serviceNowDevUrlInput = document.getElementById("serviceNowDevUrl");
  const serviceNowTestUrlInput = document.getElementById("serviceNowTestUrl");
  const serviceNowProdUrlInput = document.getElementById("serviceNowProdUrl");

  // Load the current URL from storage
  chrome.storage.sync.get(["serviceNowUrls"], (result) => {
    if (result.serviceNowUrls) {
      serviceNowDevUrlInput.value = result.serviceNowUrls.serviceNowDevUrl;
      serviceNowTestUrlInput.value = result.serviceNowUrls.serviceNowTestUrl;
      serviceNowProdUrlInput.value = result.serviceNowUrls.serviceNowProdUrl;
    }
  });

  // Save the URL to storage
  saveButton.addEventListener("click", () => {
    const serviceNowDevUrl = serviceNowDevUrlInput.value.trim();
    const serviceNowTestUrl = serviceNowTestUrlInput.value.trim();
    const serviceNowProdUrl = serviceNowProdUrlInput.value.trim();

    const serviceNowUrls = {
      serviceNowDevUrl,
      serviceNowTestUrl,
      serviceNowProdUrl,
    };

    if (serviceNowUrls) {
      chrome.storage.sync.set({ serviceNowUrls }, () => {
        console.log("ServiceNow DEV URL saved:", serviceNowDevUrl);
        console.log("ServiceNow TEST URL saved:", serviceNowTestUrl);
        console.log("ServiceNow PROD URL saved:", serviceNowProdUrl);
      });
      const successDisplay = document.getElementById("saving-success");
      successDisplay.innerText = "URL successfully saved!";
    }
  });
});
