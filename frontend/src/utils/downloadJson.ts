export const exportToJson = (
  objectData: Record<string, unknown>,
  filename = "export.json",
) => {
  const contentType = "application/json;charset=utf-8;";
  const navigator = window.navigator as any;
  if (navigator?.msSaveOrOpenBlob) {
    const blob = new Blob(
      [decodeURIComponent(encodeURI(JSON.stringify(objectData)))],
      { type: contentType },
    );
    navigator.msSaveOrOpenBlob(blob, filename);
  } else {
    const a = document.createElement("a");
    a.download = filename;
    a.href =
      "data:" +
      contentType +
      "," +
      encodeURIComponent(JSON.stringify(objectData));
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};
