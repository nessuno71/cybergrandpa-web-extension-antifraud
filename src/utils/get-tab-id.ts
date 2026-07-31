export const getActiveTab = async () => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

  return tab;
};

export const getTabId = async () => {
  const tab = await getActiveTab();

  return tab?.id;
};

export const getTabUrl = async () => {
  const tab = await getActiveTab();

  return tab?.url;
};
