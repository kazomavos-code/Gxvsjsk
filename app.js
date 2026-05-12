let outputBlob = null;

const fileInput = document.getElementById("fileInput");
const keywordInput = document.getElementById("keyword");
const useFilterInput = document.getElementById("useFilter");
const removeDupInput = document.getElementById("removeDup");
const processBtn = document.getElementById("processBtn");
const downloadBtn = document.getElementById("downloadBtn");
const progress = document.getElementById("progress");
const info = document.getElementById("info");

fileInput.addEventListener("change", function () {
  const file = fileInput.files[0];

  if (!file) return;

  info.innerHTML = "File dipilih: <b>" + escapeHtml(file.name) + "</b>";
  progress.value = 0;
  downloadBtn.disabled = true;
  outputBlob = null;
});

processBtn.addEventListener("click", async function () {
  const file = fileInput.files[0];

  if (!file) {
    alert("Upload file TXT dulu.");
    return;
  }

  processBtn.disabled = true;
  downloadBtn.disabled = true;
  info.textContent = "Memproses...";

  try {
    const keyword = keywordInput.value.toLowerCase().trim();
    const useFilter = useFilterInput.checked;
    const removeDup = removeDupInput.checked;

    const text = await file.text();
    const lines = text.split(/\r?\n/);

    const results = [];
    const seen = new Set();

    let total = 0;
    let filtered = 0;
    let removed = 0;

    for (let rawLine of lines) {
      const line = rawLine.trim();

      if (line === "") continue;

      total++;

      if (useFilter && keyword && !line.toLowerCase().includes(keyword)) {
        continue;
      }

      filtered++;

      if (removeDup) {
        if (seen.has(line)) {
          removed++;
          continue;
        }

        seen.add(line);
      }

      results.push(line);
    }

    outputBlob = new Blob([results.join("\n")], { type: "text/plain;charset=utf-8" });

    progress.value = 100;

    info.innerHTML =
      "Selesai!<br>" +
      "Total: <b>" + total + "</b><br>" +
      "Filtered: <b>" + filtered + "</b><br>" +
      "Duplicate Removed: <b>" + removed + "</b><br>" +
      "Final: <b>" + results.length + "</b>";

    downloadBtn.disabled = false;
  } catch (error) {
    info.textContent = "Error: " + error.message;
  } finally {
    processBtn.disabled = false;
  }
});

downloadBtn.addEventListener("click", function () {
  if (!outputBlob) {
    alert("Belum ada hasil.");
    return;
  }

  const a = document.createElement("a");
  a.href = URL.createObjectURL(outputBlob);
  a.download = "result.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
});

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, function (char) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char];
  });
}
