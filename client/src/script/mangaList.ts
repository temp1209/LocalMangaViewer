import { Metadatas } from "../types/metadata";
import { RawMangaQuery } from "../types/queries";
import qs from "qs"

async function loadMangaList() {
  const urlParams = new URLSearchParams(window.location.search);

  const paramPage = urlParams.get("page")
  const currentPage = paramPage ? parseInt(paramPage) : 1;
  const author = urlParams.get("author");
  const original = urlParams.get("original");
  const character = urlParams.get("character");
  const tag = urlParams.get("tag");

  const query:RawMangaQuery = {
    search:{
      authors:author,
      originals:original,
      characters:character,
      tags:tag
    },
    pageConf:{
      page:currentPage.toString()
    }
  }

  console.log(query);

  const apiEndPoint = `/api/get-manga-list?${qs.stringify(query)}`;

  fetch(apiEndPoint)
    .then((response) => response.json())
    .then((resdata) => {
      console.log(resdata);

      const { page, limit, total, data } = resdata;

      displayMangaList(data);
      updatePagination(page, Math.ceil(total / limit));
    })
    .catch((error) => {
      alert(error.message);
      console.error(error.message);
    });
}

function displayMangaList(mangaDataList: Metadatas) {
  const mangaListContainer = document.getElementById("manga-list-container");

  if (!mangaListContainer) {
    console.error("manga-list-containerが見つかりません");
    return;
  }

  mangaListContainer.innerHTML = ""; // 一覧をクリア

  mangaDataList.forEach((mangaDataItem) => {
    const mangaElement = document.createElement("div");
    mangaElement.className = "manga-item";

    //表紙要素
    const coverImage = document.createElement("img");
    if (mangaDataItem.cover) {
      if (mangaDataItem.cover.isPortrait) {
        coverImage.className = "cover__portrait";
      } else {
        coverImage.className = "cover__landscape";
      }
      coverImage.src = mangaDataItem.cover.path;
    }
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

      if (mangaDataItem.characters.length != 0) {
        //キャラクター要素
        const characterContainerElement = document.createElement("div");
        characterContainerElement.className = "character-list-container";
        characterContainerElement.textContent = "キャラクター：";
        mangaDataItem.characters.forEach((chara) => {
          const characterElement = document.createElement("div");
          characterElement.className = "character-item";
          characterElement.textContent = chara;
          characterElement.addEventListener("click", () => {
            window.location.href = `/search?character=${encodeURIComponent(chara)}`;
          });

          characterContainerElement.append(characterElement);
        });

        infoContainer.appendChild(characterContainerElement);
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
          <div class="character-list-container">
            <div class="character-item"></div>
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

  //画面を一番上に
  window.scrollTo({
    top: 0,
  });
}

function updatePagination(current: number, totalPages: number) {
  const pagination = document.getElementById("pagination");

  if (!pagination) {
    console.error("paginationが見つかりません");
    return;
  }

  pagination.innerHTML = ""; // 既存のボタンをクリア

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement("button");
    button.textContent = i.toString();
    button.disabled = i === current; // 現在のページはボタンを無効化

    button.addEventListener("click", () => {
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set("page", i.toString()); // ページ情報をクエリパラメーターに設定
      window.history.pushState({}, "", `?${urlParams.toString()}`);

      loadMangaList();
    });
    pagination.appendChild(button);
  }
}

//ページ遷移時にURLを更新
window.addEventListener("popstate", () => {
  // URLのクエリパラメーターを取得
  const urlParams = new URLSearchParams(window.location.search);
  const pageParam = urlParams.get("page");
  const page = pageParam ? parseInt(pageParam, 10) : 1; // デフォルトでページ1
  console.log("popstate:", page);

  loadMangaList(); // ページ内容を更新
});

// ページ読み込み時にフォルダをロード
document.addEventListener("DOMContentLoaded", () => {
  loadMangaList();
});
