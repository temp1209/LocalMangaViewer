async function loadTagList() {
  const tagListApiEndPoint = "/api/get-tag-list";

    fetch(tagListApiEndPoint).then((response) => response.json())
    .then((tagData) => {
      displayTagList(tagData);
    })
    .catch((e) => alert(e));
}

function displayTagList(tagList:Record<string,number>) {
  console.log(tagList);

  const tagListContainer = document.getElementById("tag-list-container");

  Object.entries(tagList).forEach(([str,count]) => {
    const tagItemElement = document.createElement("div");
    tagItemElement.className = "tag-item";
    tagItemElement.addEventListener("click",()=>{
      window.location.href = `/search?tag=${encodeURIComponent(str)}`;
    });

    const tagStrElement = document.createElement("div");
    tagStrElement.className = "tag-str";
    tagStrElement.textContent = str;
    tagItemElement.appendChild(tagStrElement);

    const tagCountElement = document.createElement("div");
    tagCountElement.className = "tag-count";
    tagCountElement.textContent = count.toString();
    tagItemElement.appendChild(tagCountElement);

    tagListContainer?.appendChild(tagItemElement);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadTagList();
});