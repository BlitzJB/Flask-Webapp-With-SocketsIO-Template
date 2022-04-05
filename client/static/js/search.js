import { getQueryVariable } from "./utils.js";


function loadSearchResults() {

    const searchFor = document.querySelector(".search-for");
    const resultContainer = document.querySelector(".results__container");

    

    const query = getQueryVariable("q");
    if (!query) {
        searchFor.innerHTML = "Use the search bar above to search";
        return
    }

    resultContainer.innerHTML = "Loading...";

    function trimString(string) {
        if (string.length > 25) {
            return `${string.substring(0, 25)}...`
        } else {
            return string
        }
    }

    searchFor.innerHTML = `Search results for "${query}"`;
    fetch(`https://ytmusic-interactions.blitzsite.repl.co/search?query=${query}`)
        .then(response => response.json())
        .then(data => {
            resultContainer.innerHTML = "";
            data.forEach(item => {
                const template = `
                    <img src="${item.thumbnail.mini}" alt="Search Result" class="result__thumbnail">
                    <div class="result__details">
                        <h3 class="result__title">
                            ${trimString(item.title)}
                        </h3>
                        <div class="result__subtitle">
                            <p class="result__artist">${trimString(item.artists.join(', '))}</p>
                            <p class="result__duration">${item.length}</p>
                        </div>
                    </div>
                `
                const li = document.createElement("li");
                li.classList.add("result");
                li.innerHTML = template;
                li.addEventListener("click", () => {
                    window.location.href = `/song?id=${item.id}`
                })
                resultContainer.appendChild(li);
            })
        })

}   

document.addEventListener("DOMContentLoaded", loadSearchResults);