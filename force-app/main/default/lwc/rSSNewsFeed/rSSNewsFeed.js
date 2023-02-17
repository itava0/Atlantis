import { LightningElement } from "lwc";
import fetchFeed from "@salesforce/apex/RSSFeed.fetchFeed";
export default class RSSNewsFeed extends LightningElement {
  data = null;
  connectedCallback() {
    //Call apex method to fetch RSS feeds
    fetchFeed().then((result) => {
      //Create temporary document to merge all feeds
      const mergedDoc = document.implementation.createDocument(null, "Feed");

      //Loop through each feed and append to merged document
      result.forEach((item) => {
        const source = new DOMParser().parseFromString(item, "text/xml");
        const items = source.querySelectorAll("item");
        if(items.length > 0) {
          mergedDoc.documentElement.append(...items);
        }
      });
      console.log("Merged Doc: ", mergedDoc);
      
      //Loop through merged document and create data array
      const items = mergedDoc.querySelectorAll("item");
      const data = [];
      items.forEach((item) => {
        const title = item.querySelector("title").textContent;
        const description = item
          .querySelector("description")
          .textContent.replace(/(<p>.*?<\/p>)(?!\s*<p>)/, "");
        const link = item.querySelector("link").textContent;
        const date = item.querySelector("pubDate").textContent;
        data.push({ title, description, link, date });
      });

      //Sort data by date
      console.log(data);
      const dataSort = data.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
      console.log(dataSort);

      //Add data to DOM
      // eslint-disable-next-line @lwc/lwc/no-inner-html
      this.template.querySelector(".newsFeed").innerHTML = dataSort
        .map((item) => {
          return `<div class="slds-card">
                            <div class="slds-card__header slds-grid">
                                <header class="slds-media slds-media_center slds-has-flexi-truncate">
                                    <div class="slds-media
                                        slds-media_center">
                                        <div class="slds-media
                                            slds-media_center
                                            slds-media__figure">
                                            <span class="slds-icon_container
                                                slds-icon-utility-announcement">
                                                <svg class="slds-icon
                                                    slds-icon-text-light
                                                    slds-icon_small"
                                                    aria-hidden="true">
                                                    <use xlink:href="/_slds/icons/utility-sprite/svg/symbols.svg#news"></use>
                                                </svg>
                                            </span>
                                        </div>
                                        <div class="slds-media
                                            slds-media_center
                                            slds-media__body">
                                            <h2>
                                                <a href="${item.link}" target="_blank">${item.title}</a>
                                            </h2>
                                        </div>
                                    </div>
                                </header>
                            </div>
                            <div class="slds-card__body slds-card__body_inner">
                                ${item.description}
                                <p class="slds-text-body_small
                                    slds-text-color_weak">
                                    ${item.date}
                                </p>
                            </div>
                        </div>`;
        })
        .join("");
    });
  }
}