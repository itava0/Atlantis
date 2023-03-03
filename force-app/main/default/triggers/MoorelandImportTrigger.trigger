trigger MoorelandImportTrigger on MoorelandImport__c (after insert) {
	ImportPartnerProperties.importMoorelandProperties();
}