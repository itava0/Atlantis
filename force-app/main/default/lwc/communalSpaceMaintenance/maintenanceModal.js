import { api } from "lwc";
import LightningModal from "lightning/modal";
import CreateCSMaintenance from "@salesforce/apex/Announcements.CreateCSMaintenance";

export default class MaintenanceModal extends LightningModal {
  //Modal for gathering info to create communal space maintenance records.
  @api communalSpaceId;
  startDateTime = undefined;
  endDateTime = undefined;
  announcementDetails = undefined;

  handleStartDateTimeChange(event) {
    this.startDateTime = event.target.value;
  }

  handleEndDateTimeChange(event) {
    this.endDateTime = event.target.value;
  }

  handleAnnouncementDetailsChange(event) {
    this.announcementDetails = event.target.value;
  }

  async handleOkay() {
    await CreateCSMaintenance({
      communalSpaceId: this.communalSpaceId,
      startDateTime: this.startDateTime,
      endDateTime: this.endDateTime,
      body: this.announcementDetails
    })
      .then((result) => {
        console.log("result", result);
        this.close(this.communalSpaceId);
      })
      .catch((error) => {
        console.log("error", error);
      });
  }
}