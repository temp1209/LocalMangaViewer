async function loadTagList() {
  const tagListApiEndPoint = "/api/get-tag-list";

    fetch(tagListApiEndPoint).then((response) => response.json())
    .then((tagData) => {
      displayTagList(tagData);
    })
    .catch((e) => alert(e));
}

function displayTagList(tagList) {
  console.log(tagList);

  const tagListContainer = document.getElementById("tag-list-container");

  tagList.forEach((tagData) => {
    const tagItemElement = document.createElement("div");
    tagItemElement.className = "tag-item";
    tagItemElement.addEventListener("click",()=>{
      window.location.href = `/search?tag=${encodeURIComponent(tagData.str)}`;
    });

    const tagStrElement = document.createElement("div");
    tagStrElement.className = "tag-str";
    tagStrElement.textContent = tagData.str;
    tagItemElement.appendChild(tagStrElement);

    const tagCountElement = document.createElement("div");
    tagCountElement.className = "tag-count";
    tagCountElement.textContent = tagData.count;
    tagItemElement.appendChild(tagCountElement);

    tagListContainer.appendChild(tagItemElement);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadTagList();
});