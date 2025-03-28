async function loadMangaList() {
  const urlParams = new URLSearchParams(window.location.search);

  const currentPage = urlParams.get("page") || 1;
  const author = urlParams.get("author");
  const original = urlParams.get("original");
  const charactor = urlParams.get("charactor");
  const tag = urlParams.get("tag");

  const queryParams = [];

  queryParams.push(`page=${currentPage}`);
  if (author) queryParams.push(`author=${encodeURIComponent(author)}`);
  if (original) queryParams.push(`original=${encodeURIComponent(original)}`);
  if (charactor) queryParams.push(`charactor=${encodeURIComponent(charactor)}`);
  if (tag) queryParams.push(`tag=${encodeURIComponent(tag)}`);

  const searchQuery = queryParams.join("&");

  console.log(searchQuery);

  const apiEndPoint = `/api/get-manga-list?${searchQuery}`;

  fetch(apiEndPoint)
    .then((response) => response.json())
    .then((resdata) => {
      console.log(resdata);

      const { page, limit, total, data } = resdata;

      displayMangaList(data);
      updatePagination(page, Math.ceil(total / limit));
    })
    .catch((error) => alert(error.message));
}

function displayMangaList(mangaDataList) {
  const mangaListContainer = document.getElementById("manga-list-container");
  mangaListContainer.innerHTML = ""; // 一覧をクリア

  mangaDataList.forEach((mangaDataItem) => {
    const mangaElement = document.createElement("div");
    mangaElement.className = "manga-item";

    //表紙要素
    const coverImage = document.createElement("img");
    if (mangaDataItem.cover.isPortrait) {
      coverImage.className = "cover__portrait";
    } else {
      coverImage.className = "cover__landscape";
    }
    coverImage.src = mangaDataItem.cover.path;
    coverImage.alt = mangaDataItem.title;
    coverImage.addEventListener("click", () => {
      window.location.href = `/viewer?id=${mangaDataItem.id}`;
    });
    mangaElement.appendChild(coverImage);

    //情報要素
    const infoContainer = document.createElement("div");
    infoContainer.className = "info-container";

    //タイトル要素
    const titleElement = document.createElement("div");
    titleElement.className = "title";
    titleElement.textContent = mangaDataItem.title;
    titleElement.addEventListener("click", () => {
      window.location.href = `/viewer?id=${mangaDataItem.id}`;
    });
    infoContainer.appendChild(titleElement);

    //作者要素
    const authorsElement = document.createElement("div");
    authorsElement.className = "author";

    mangaDataItem.authors.forEach((author, index) => {
      const authorLink = document.createElement("span");
      authorLink.className = "author-link";
      authorLink.textContent = author;
      authorLink.addEventListener("click", () => {
        window.location.href = `/search?author=${encodeURIComponent(author)}`;
      });

      authorsElement.appendChild(authorLink);

      // 最後の作者でない場合はカンマを追加
      if (index < mangaDataItem.authors.length - 1) {
        const separator = document.createTextNode(", ");
        authorsElement.appendChild(separator);
      }
    });
    infoContainer.appendChild(authorsElement);

    //サークル名要素
    if (mangaDataItem.groups.length != 0) {
      const groupElement = document.createElement("div");
      groupElement.className = "group";
      groupElement.textContent = "サークル：" + mangaDataItem.groups.join(", ");
      infoContainer.appendChild(groupElement);
    }

    //二次創作情報要素
    if (mangaDataItem.originals.length != 0) {
      //原作名要素
      const originalElement = document.createElement("div");
      originalElement.className = "original";
      originalElement.textContent = "原作：" + mangaDataItem.originals.join(", ");
      infoContainer.appendChild(originalElement);

      if (mangaDataItem.charactors.length != 0) {
        //キャラクター要素
        const charactorContainerElement = document.createElement("div");
        charactorContainerElement.className = "charactor-list-container";
        charactorContainerElement.textContent = "キャラクター：";
        mangaDataItem.charactors.forEach((chara) => {
          const charactorElement = document.createElement("div");
          charactorElement.className = "charactor-item";
          charactorElement.textContent = chara;
          charactorElement.addEventListener("click", () => {
            window.location.href = `/search?charactor=${encodeURIComponent(chara)}`;
          });

          charactorContainerElement.append(charactorElement);
        });

        infoContainer.appendChild(charactorContainerElement);
      }
    }

    //タグ要素
    const tagsContainerElement = document.createElement("div");
    tagsContainerElement.className = "tag-list-container";
    mangaDataItem.tags.forEach((tag) => {
      const tagElement = document.createElement("div");
      tagElement.className = "tag-item";
      tagElement.textContent = tag;
      tagElement.addEventListener("click", () => {
        window.location.href = `/search?tag=${encodeURIComponent(tag)}`;
      });

      tagsContainerElement.appendChild(tagElement);
    });
    infoContainer.appendChild(tagsContainerElement);

    mangaElement.appendChild(infoContainer);

    //今までの要素をひとまとまりとして登録
    mangaListContainer.appendChild(mangaElement);

    //画面を一番上に
    window.scrollTo({
      top: 0,
    });
  });

  /*
    最終的なhtml
    <div id="manga-list-container">
      <div class="manga-item">
        <img class="cover" scr="...">
        <div class="info">
          <div class="title"></div>
          <div class="author"></div>
          <div class="group"></div>
          <div class="original"></div>
          <div class="charactor-list-container">
            <div class="charactor-item"></div>
          </div>
          <div class="tag-list-container">
            <div class="tag-item"></div>
            ...
          </div>
        </div>
      </div>
      ...
    </div>
  */
}

function updatePagination(current, totalPages) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = ""; // 既存のボタンをクリア

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement("button");
    button.textContent = i;
    button.disabled = i === current; // 現在のページはボタンを無効化

    button.addEventListener("click", () => {
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set("page", i); // ページ情報をクエリパラメーターに設定
      window.history.pushState({}, "", `?${urlParams.toString()}`);

      loadMangaList();
    });
    pagination.appendChild(button);
  }
}

//ページ遷移時にURLを更新
window.addEventListener("popstate", (event) => {
  // URLのクエリパラメーターを取得
  const urlParams = new URLSearchParams(window.location.search);
  const page = parseInt(urlParams.get("page") || 1, 10); // デフォルトでページ1
  console.log("popstate:", page);

  loadMangaList(); // ページ内容を更新
});

// ページ読み込み時にフォルダをロード
document.addEventListener("DOMContentLoaded", () => {
  loadMangaList();
});
