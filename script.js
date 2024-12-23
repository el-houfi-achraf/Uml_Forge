// ...existing code...

document.getElementById("promptButton").addEventListener("click", function () {
  const promptInput = document.getElementById("promptInput");
  if (
    promptInput.style.display === "none" ||
    promptInput.style.display === ""
  ) {
    promptInput.style.display = "block";
    promptInput.focus();
  } else {
    promptInput.style.display = "none";
  }
});
