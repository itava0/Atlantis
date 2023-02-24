import { LightningElement } from "lwc";
import getAllCommunities from "@salesforce/apex/CommunalSpaces.getAllCommunities";
import getCommunalSpaces from "@salesforce/apex/CommunalSpaces.getCommunalSpaces";
import getMaintenance from "@salesforce/apex/CommunalSpaces.getMaintenance";
import MaintenanceModal from "./maintenanceModal";

export default class CommunalSpaceMaintenance extends LightningElement {
  communities = undefined;
  communityId = undefined;
  communalSpaces = undefined;
  communalSpaceId = undefined;
  communalSpaceMaintenance = undefined;
  error = undefined;

  connectedCallback() {
    //Retrieve full list of community records
    getAllCommunities()
      .then((result) => {
        this.communities = result;
        console.log("communities", result);
      })
      .catch((error) => {
        this.error = error;
        console.log("error", error);
      });
  }

  //On community selection, retrieve communal spaces associated with it
  handleCommunitySelect(event) {
    console.log("Selected community: ", event.target.dataset.id);
    this.communityId = event.target.dataset.id;
    this.communalSpaceId = undefined;
    this.communalSpaceMaintenance = undefined;
    getCommunalSpaces({ communityId: this.communityId })
      .then((result) => {
        this.communalSpaces = result;
        console.log("communal spaces", result);
      })
      .catch((error) => {
        this.error = error;
        console.log("error", error);
      });
  }

  //On communal space selection, retrieve associated maintenance records
  handleSpaceSelect(event) {
    console.log("Selected space: ", event.target.dataset.id);
    this.communalSpaceId = event.target.dataset.id;
    getMaintenance({ communalSpaceId: this.communalSpaceId })
      .then((result) => {
        this.communalSpaceMaintenance = result;
        console.log("maintenance", result);
      })
      .catch((error) => {
        this.error = error;
        console.log("error", error);
      });
  }

  //Call modal to handle creation of maintenance record associated with selected communal space
  async handleScheduleMaintenance() {
    const result = await MaintenanceModal.open({
      size: "small",
      description: "Accessible description of modal's purpose",
      communalSpaceId: this.communalSpaceId
    });
    getMaintenance({ communalSpaceId: result })
      .then((result2) => {
        this.communalSpaceMaintenance = result2;
      })
      .catch((error) => {
        this.error = error;
        console.log("error", error);
      });
    console.log("result", result);
  }
}