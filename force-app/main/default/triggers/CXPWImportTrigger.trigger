trigger CXPWImportTrigger on CXPW_Import__c (after insert) {
	ImportPartnerProperties.importCXPWProperties();
}