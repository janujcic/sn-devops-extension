// Function to generate the ServiceNow link based on the file name or other criteria
function generateServiceNowLink(fileName, serviceNowUrl) {
  // Extract the table name and sys_id from the file name
  const parts = fileName.split("_");
  const tableName = parts.slice(0, parts.length - 1).join("_");
  const sysIdWithExtension = parts[parts.length - 1];
  const sysId = sysIdWithExtension.split(".")[0];

  return [
    `${serviceNowUrl}nav_to.do?uri=${tableName}.do?sys_id=${encodeURIComponent(
      sysId
    )}`,
    sysId,
  ];
}

function openTwoWindows(firstLink, secondLink) {
  const screenWidth = window.screen.availWidth; // Use available screen width
  const screenHeight = window.screen.availHeight; // Use available screen height

  const screenLeft = window.screenLeft || window.screenX;
  const screenTop = window.screenTop || window.screenY;

  // Open the first window on the left
  window.open(
    firstLink,
    "_blank",
    `width=${
      screenWidth / 2
    },height=${screenHeight},left=${screenLeft},top=${screenTop}`
  );

  // Open the second window on the right
  window.open(
    secondLink,
    "_blank",
    `width=${screenWidth / 2},height=${screenHeight},left=${
      screenLeft + screenWidth / 2
    },top=${screenTop}`
  );
}

function createDropdown(docSysId, serviceNowLinks) {
  const dropdown = document.createElement("select");
  dropdown.className = `service-now-dropdown_${docSysId}`;
  dropdown.style.marginLeft = "10px"; // Adjust styling as needed
  dropdown.style.backgroundColor = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches
    ? "#333333"
    : "#ffffff";
  dropdown.style.color = window.matchMedia("(prefers-color-scheme: dark)")
    .matches
    ? "#ffffff"
    : "#000000";
  dropdown.style.border = `1px solid ${
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "#555555"
      : "#ccc"
  }`;

  const defaultOption = document.createElement("option");
  defaultOption.textContent = "Record in environments";
  defaultOption.disabled = true;
  defaultOption.selected = true;
  dropdown.appendChild(defaultOption);

  const links = [
    { name: "View in ServiceNow DEV", href: serviceNowLinks.serviceNowDevLink },
    {
      name: "View in ServiceNow TEST",
      href: serviceNowLinks.serviceNowTestLink,
    },
    {
      name: "View in ServiceNow PROD",
      href: serviceNowLinks.serviceNowProdLink,
    },
    {
      name: "Open DEV/TEST",
      action: () =>
        openTwoWindows(
          serviceNowLinks.serviceNowDevLink,
          serviceNowLinks.serviceNowTestLink
        ),
    },
    {
      name: "Open TEST/PROD",
      action: () =>
        openTwoWindows(
          serviceNowLinks.serviceNowTestLink,
          serviceNowLinks.serviceNowProdLink
        ),
    },
  ];

  links.forEach((link) => {
    const option = document.createElement("option");
    option.textContent = link.name;
    if (link.href) {
      option.value = link.href;
    } else if (link.action) {
      option.setAttribute("data-action", "true");
    }
    dropdown.appendChild(option);
  });

  dropdown.addEventListener("change", (event) => {
    const selectedOption = event.target.options[event.target.selectedIndex];
    const action = selectedOption.getAttribute("data-action");

    if (action) {
      const selectedLink = links.find(
        (link) => link.name === selectedOption.text
      );
      selectedLink?.action();
    } else if (event.target.value) {
      // Open the selected link in a new tab
      window.open(event.target.value, "_blank");
    }

    dropdown.selectedIndex = 0;
  });
  return dropdown;
}

// Function to inject the ServiceNow link into the Azure DevOps page
function addServiceNowLink(serviceNowUrls) {
  const serviceNowDevUrl =
    serviceNowUrls.serviceNowDevUrl || "https://default.service-now.com/";
  const serviceNowTestUrl =
    serviceNowUrls.serviceNowTestUrl || "https://default.service-now.com/";
  const serviceNowProdUrl =
    serviceNowUrls.serviceNowProdUrl || "https://default.service-now.com/";

  var serviceNowLinks;

  const classElement =
    ".flex-grow.absolute-fill.repos-changes-viewer.flex-column.rhythm-vertical-16.scroll-auto.scroll-auto-hide.custom-scrollbar.is-folder";
  const folderElement = document.querySelector(classElement);
  if (folderElement) {
    const commitElement =
      ".repos-summary-header.flex-noshrink.bolt-card.flex-column.depth-8.bolt-card-white";
    const childElements = folderElement.querySelectorAll(commitElement);

    if (childElements) {
      childElements.forEach((childElement) => {
        // Select the nested elements
        const flexRow = childElement.querySelector(".flex-row");
        const cardContent = childElement.querySelector(
          ".bolt-card-content.flex-row.flex-grow.bolt-default-horizontal-spacing"
        );
        let serviceNowLink, docSysId, fileTitle, xmlSummary, fileName;

        if (flexRow) {
          fileTitle = flexRow.querySelector("span.text-ellipsis");
          fileName = fileTitle.textContent.trim();
          let fileNameParts = fileName.split(".");
          if (fileNameParts[fileNameParts.length - 1] == "xml") {
            [serviceNowDevLink, docSysId] = generateServiceNowLink(
              fileName,
              serviceNowDevUrl
            );
            [serviceNowTestLink, docSysId] = generateServiceNowLink(
              fileName,
              serviceNowTestUrl
            );
            [serviceNowProdLink, docSysId] = generateServiceNowLink(
              fileName,
              serviceNowProdUrl
            );
            serviceNowLinks = {
              serviceNowDevLink,
              serviceNowTestLink,
              serviceNowProdLink,
            };
          }
        }

        if (
          typeof fileTitle === "undefined" ||
          typeof docSysId === "undefined"
        ) {
          return;
        }

        // Check if the link already exists to prevent duplicate links
        if (!childElement.querySelector(`.service-now-dropdown_${docSysId}`)) {
          const dropdown = createDropdown(docSysId, serviceNowLinks);
          fileTitle.appendChild(dropdown);
        }
      });
    }
  } else {
    const fileElements = document.querySelectorAll(".body-m.text-ellipsis");
    fileElements.forEach((fileElement) => {
      const fileName = fileElement.textContent.trim();
      console.log(fileName);
      let fileNameParts = fileName.split(".");
      if (fileNameParts[fileNameParts.length - 1] != "xml") {
        return;
      }
      [serviceNowDevLink, docSysId] = generateServiceNowLink(
        fileName,
        serviceNowDevUrl
      );
      [serviceNowTestLink, docSysId] = generateServiceNowLink(
        fileName,
        serviceNowTestUrl
      );
      [serviceNowProdLink, docSysId] = generateServiceNowLink(
        fileName,
        serviceNowProdUrl
      );
      serviceNowLinks = {
        serviceNowDevLink,
        serviceNowTestLink,
        serviceNowProdLink,
      };

      if (!document.querySelector(`.service-now-dropdown_${docSysId}`)) {
        const dropdown = createDropdown(docSysId, serviceNowLinks);
        fileElement.appendChild(dropdown);
      }

      const xmlSummary = "";

      if (
        !document.querySelector(`.document_summary_button_${docSysId}`) &&
        xmlSummary != "" &&
        false
      ) {
        // Create the "Summary" button
        const summaryButton = document.createElement("button");
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

        summaryButton.addEventListener("click", (event) => {
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
  const xmlElements = document.querySelectorAll(
    ".repos-line-content.added , .repos-line-content.unchanged"
  );

  // Initialize an array to store the XML lines
  let xmlLines = [];

  // Loop through each element and extract its inner text
  xmlElements.forEach((element) => {
    const text = element.innerText.replace("Plus", "").trim();
    xmlLines.push(text);
  });

  // Join the lines to form the complete XML string
  let xmlContent = xmlLines.join("\n");

  // Return or log the complete XML string
  console.log(xmlContent);
  return xmlContent;
}

// Function to open a small pop-up window with the summary of the XML file
function openSummaryPopup(event, fileName, xmlSummary) {
  // Remove any existing pop-ups
  const existingPopup = document.querySelector(".summary-popup");
  if (existingPopup) {
    existingPopup.remove();
  }
  xmlSummary = JSON.stringify(xmlSummary);
  // Generate summary content (this should be replaced with the actual summary generation logic)
  const summaryContent = `<b>Summary for ${fileName}</b><br><br>${xmlSummary}`;

  // Create the pop-up element
  const popup = document.createElement("div");
  popup.className = "summary-popup";
  popup.style.position = "absolute";
  popup.style.backgroundColor = "#333"; // Dark background
  popup.style.color = "#fff"; // White text
  popup.style.border = "1px solid #555"; // Border
  popup.style.padding = "10px";
  popup.style.borderRadius = "8px";
  popup.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.2)"; // Subtle shadow
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
      document.removeEventListener("click", handleOutsideClick);
    }
  }

  document.addEventListener("click", handleOutsideClick);
}

// Debounce function to limit how often addServiceNowLink can be called
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Retrieve the serviceNowUrl from storage and initialize
chrome.storage.sync.get(["serviceNowUrls"], (result) => {
  const serviceNowUrls = result.serviceNowUrls;

  // Attach the global click event listener
  document.addEventListener(
    "click",
    debounce(() => addServiceNowLink(serviceNowUrls), 300)
  );

  // Initial run to catch any elements already on the page
  window.addEventListener("load", () => addServiceNowLink(serviceNowUrls));
});
