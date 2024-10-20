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
  const classElement = ".flex-grow.absolute-fill.repos-changes-viewer.flex-column.rhythm-vertical-16.scroll-auto.scroll-auto-hide.custom-scrollbar.is-folder";
  const folderElement = document.querySelector(classElement); // Adjust the selector as needed
  if (folderElement) {
	const commitElement = ".repos-summary-header.flex-noshrink.bolt-card.flex-column.depth-8.bolt-card-white";
	const childElements = folderElement.querySelectorAll(commitElement);

	if (childElements) {
		childElements.forEach(childElement => {
			// Select the nested elements
			const flexRow = childElement.querySelector('.flex-row');
			const cardContent = childElement.querySelector('.bolt-card-content.flex-row.flex-grow.bolt-default-horizontal-spacing');
			let serviceNowLink, docSysId, fileTitle, xmlSummary, fileName;
			
			if (flexRow) {
				fileTitle = flexRow.querySelector('span.text-ellipsis');
				fileName = fileTitle.textContent.trim();
				let fileNameParts = fileName.split(".");
				if (fileNameParts[fileNameParts.length - 1] == "xml") {
					[serviceNowLink, docSysId] = generateServiceNowLink(fileName, baseServiceNowUrl);
				}
			}
			
			
			if (typeof fileTitle === 'undefined' || typeof docSysId === 'undefined') {
				return;
			} 
			
			// Check if the link already exists to prevent duplicate links
			if (!childElement.querySelector(`.service-now-link_${docSysId}`)) {

				// Create the link element
				const linkElement = document.createElement('a');
				linkElement.href = serviceNowLink;
				linkElement.textContent = "View in ServiceNow";
				linkElement.target = "_blank";
				linkElement.className = `service-now-link_${docSysId}`;
				linkElement.style.marginLeft = "10px"; // Adjust styling as needed

				// Append the link to the file element
				fileTitle.appendChild(linkElement);
			}
			
			
		});
	}
	}
	else {
		const fileElements = document.querySelectorAll('.body-m.text-ellipsis');
		fileElements.forEach(fileElement => {
			const fileName = fileElement.textContent.trim();
			console.log(fileName);
			let fileNameParts = fileName.split(".");
			if (fileNameParts[fileNameParts.length - 1] != "xml") {
				return;
			}
			const [serviceNowLink, docSysId] = generateServiceNowLink(fileName, baseServiceNowUrl);
			
			if (!document.querySelector(`.service-now-link_${docSysId}`)) {

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
			
			const xmlSummary = "";
			
			if (!document.querySelector(`.document_summary_button_${docSysId}`) && xmlSummary != "" && false) {
				// Create the "Summary" button 
				const summaryButton = document.createElement('button');
				summaryButton.textContent = "Summary";
				summaryButton.className = `document_summary_button_${docSysId}`;
				summaryButton.style.marginLeft = "10px";
				summaryButton.style.borderRadius = "12px";
				summaryButton.style.padding = "5px 10px";
				summaryButton.style.cursor = "pointer";
				summaryButton.style.backgroundColor = "#333"; // Dark background
				summaryButton.style.color = "#fff"; // White text
				summaryButton.style.border = "1px solid #555"; // Slightly lighter border
				summaryButton.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.2)"; // Subtle shadow

				summaryButton.addEventListener('click', (event) => {
				openSummaryPopup(event, fileName, xmlSummary);
				});

				// Append the link to the file element
				fileElement.appendChild(summaryButton);
			}
			
		});
		
	}
}



function extractXML(htmlElement) {
	let xmlValues = {};
	// Select all elements containing the XML lines
    const xmlElements = document.querySelectorAll('.repos-line-content.added , .repos-line-content.unchanged');
	
	// Initialize an array to store the XML lines
    let xmlLines = [];
    
    // Loop through each element and extract its inner text
    xmlElements.forEach(element => {
		const text = element.innerText.replace('Plus', '').trim();
		xmlLines.push(text);
    });
	
	// Join the lines to form the complete XML string
    let xmlContent = xmlLines.join('\n');
    
    // Return or log the complete XML string
    console.log(xmlContent);
    return xmlContent;

}

// Function to open a small pop-up window with the summary of the XML file
function openSummaryPopup(event, fileName, xmlSummary) {
  // Remove any existing pop-ups
  const existingPopup = document.querySelector('.summary-popup');
  if (existingPopup) {
    existingPopup.remove();
  }
  xmlSummary = JSON.stringify(xmlSummary);
  // Generate summary content (this should be replaced with the actual summary generation logic)
  const summaryContent = `<b>Summary for ${fileName}</b><br><br>${xmlSummary}`;

  // Create the pop-up element
  const popup = document.createElement('div');
  popup.className = 'summary-popup';
  popup.style.position = 'absolute';
  popup.style.backgroundColor = '#333'; // Dark background
  popup.style.color = '#fff'; // White text
  popup.style.border = '1px solid #555'; // Border
  popup.style.padding = '10px';
  popup.style.borderRadius = '8px';
  popup.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)'; // Subtle shadow
  popup.style.zIndex = 1000; // Ensure it's on top
  popup.innerHTML = `<p>${summaryContent}</p>`;

  // Position the pop-up next to the button
  const rect = event.target.getBoundingClientRect();
  popup.style.top = `${rect.bottom + window.scrollY}px`;
  popup.style.left = `${rect.left + window.scrollX}px`;

  // Append the pop-up to the body
  document.body.appendChild(popup);

  // Remove the pop-up when clicking outside of it
 function handleOutsideClick(e) {
    if (!popup.contains(e.target) && e.target !== event.target) {
      popup.remove();
      document.removeEventListener('click', handleOutsideClick);
    }
  }

  document.addEventListener('click', handleOutsideClick);
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