// Function to generate the ServiceNow link based on the file name or other criteria
function generateServiceNowLink(fileName, baseServiceNowUrl) {
  // Extract the table name and sys_id from the file name
  const parts = fileName.split('_');
  const tableName = parts.slice(0, parts.length - 1).join('_');
  const sysIdWithExtension = parts[parts.length - 1];
  const sysId = sysIdWithExtension.split('.')[0];
	
  // Adjust this part to create the correct URL based on your ServiceNow instance
  return [`${baseServiceNowUrl}nav_to.do?uri=${tableName}.do?sys_id=${encodeURIComponent(sysId)}`, sysId];

}


// Function to inject the ServiceNow link into the Azure DevOps page
function addServiceNowLink(baseServiceNowUrl) {
  // Check for the specific element where you want to add the link (e.g., file list, commit details)
  const fileElements = document.querySelectorAll('.body-m.text-ellipsis'); // Adjust the selector as needed
  fileElements.forEach(fileElement => {
    const fileName = fileElement.textContent.trim();
	let fileNameParts = fileName.split(".");
	if (fileNameParts[fileNameParts.length - 1] != "xml") {
		return;
	}
    const [serviceNowLink, docSysId] = generateServiceNowLink(fileName, baseServiceNowUrl);

    // Check if the link already exists to prevent duplicate links
    if (!fileElement.querySelector(`.service-now-link_${docSysId}`)) {

      // Create the link element
      const linkElement = document.createElement('a');
      linkElement.href = serviceNowLink;
      linkElement.textContent = "View in ServiceNow";
      linkElement.target = "_blank";
      linkElement.className = `service-now-link_${docSysId}`;
      linkElement.style.marginLeft = "10px"; // Adjust styling as needed

      // Append the link to the file element
      fileElement.appendChild(linkElement);
    }
  });
}
// Debounce function to limit how often addServiceNowLink can be called
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Retrieve the baseServiceNowUrl from storage and initialize
chrome.storage.sync.get(['baseServiceNowUrl'], (result) => {
  const baseServiceNowUrl = result.baseServiceNowUrl || 'https://default.service-now.com/'; // Default URL
  console.log('Using ServiceNow URL:', baseServiceNowUrl);

  // Attach the global click event listener
  document.addEventListener('click', debounce(() => addServiceNowLink(baseServiceNowUrl), 300));

  // Initial run to catch any elements already on the page
  window.addEventListener('load', () => addServiceNowLink(baseServiceNowUrl));
});