import { LightningElement, api } from "lwc";
import addPet from "@salesforce/apex/updateLease.addPet";
import addRoommate from "@salesforce/apex/updateLease.addRoommate";
import addStorage from "@salesforce/apex/updateLease.addStorage";
import createRoommate from "@salesforce/apex/updateLease.roommate";

export default class UpdateLease extends LightningElement {
  @api recordId;
  pet
  roommate
  fName;
  lName;
  birthdate;
  phone;
  showModal = false;
  storage = true;
  showTypeSelection = true;
  showPetQuestions = false;
  showRoommateQuestions = false;
  showStorageQuestions = false;


  handleFirstName(e) {
    this.fName = e.target.value;
  }

  handleLastName(e) {
    this.lName = e.target.value;
  }

  handleBirthdate(e) {
    this.birthdate = e.target.value;
  }

  handlePhone(e) {
    this.phone = e.target.value;
  }

  handlePet(e) {
    this.pet = e.target.value;
  }

  handleStorage(e) {
    this.storage = e.target.value;
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.showTypeSelection = true;
    this.showPetQuestions = false;
    this.showRoommateQuestions = false;
    this.showStorageQuestions = false;
  }

  handleTypeChange(event) {
    this.showTypeSelection = false;
    switch (event.target.value) {
      case "Pet":
        this.showPetQuestions = true;
        break;
      case "Roommate":
        this.showRoommateQuestions = true;
        break;
      case "Storage":
        this.showStorageQuestions = true;
        break;
      default:
        break;
    }
  }

  onSubmit() {
    if (this.showRoommateQuestions) {
      createRoommate({
        firstName: this.fName,
        lastName: this.lName,
        dateOfBirth: this.birthdate,
        phone: this.phone
      }).then((resp) => {
        addRoommate({
          roommate: resp,
          leaseId: this.recordId
        });
      });
    } else if (this.showPetQuestions) {
      addPet({
        pet: this.pet,
        leaseId: this.recordId
      });
    } else {
      addStorage({
        storage: this.storage,
        leaseId: this.recordId
      })
    }
    this.showModal = false;
  }
}