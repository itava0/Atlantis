import { LightningElement, wire } from "lwc";
import GetAnnouncements from "@salesforce/apex/Announcements.GetAnnouncements";

export default class Announcements extends LightningElement {
  //Get announcements from the Announcements object
  @wire(GetAnnouncements)
  announcements;
}