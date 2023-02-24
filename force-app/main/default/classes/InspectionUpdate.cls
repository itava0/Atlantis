public class InspectionUpdate {
    public static void InspectionUpdateEvent(List<Inspection__c> insList, Map<Id, Inspection__c> insOldMap) {
        List<Id> insIds = new List<Id>();
        for (Inspection__c ins : insList) {
            insIds.add(ins.Id);
        }
        List<Event> evtList = [SELECT Id, OwnerId FROM Event WHERE Inspection__c IN: insIds];
        List<Event> evtToDelete = new List<Event>();
        
        // For storing information that needs to be passed from updated inspection to event
        Boolean newEvent = false;
        DateTime newDateTime;
        Id newInspector;
        Id newProperty;
        String newSubjects;
        Id newInspection;
        Id newOwner;
        
        for (Inspection__c ins : insList) {
            for (Event evt : evtList) {
                // If inspection updated, flag that event needs to be updated as well
                if (ins.DateTime__c != insOldMap.get(ins.Id).DateTime__c ||
                ins.Inspector__c != insOldMap.get(ins.Id).Inspector__c ||
                ins.Property__c != insOldMap.get(ins.Id).Property__c ||
                ins.Subjects__c != insOldMap.get(ins.Id).Subjects__c) {
                    newEvent = true;
                    newDateTime = ins.DateTime__c;
                    newInspector = ins.Inspector__c;
                    newProperty = ins.Property__c;
                    newSubjects = ins.Subjects__c;
                    newInspection = ins.Id;
                    newOwner = evt.OwnerId; 
                    evtToDelete.add(evt);
                }
            }
        }
        
        // Delete and replace event with new information (an update wouldn't work, as it would call the update inspection flow recursively)
        if (newEvent) {
            delete evtToDelete;
            Event evt = new Event(OwnerId = newOwner, StartDateTime = newDateTime, WhatId = newInspector, Property__c = newProperty, Inspection__c = newInspection,
                              Inspection_Subjects__c = newSubjects, Subject = 'Inspection', DurationInMinutes = 60, ActivityDateTime = newDateTime);
        	insert evt;
        }
        
    }
}