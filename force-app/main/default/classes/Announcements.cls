public without sharing class Announcements {
  @AuraEnabled(cacheable=true)
  public static List<Announcement__c> GetAnnouncements() {
    List<Communal_Space_Maintenance__c> maintenance = CommunalSpaces.getRelatedMaintenance();
    return [
      SELECT Id, Name, Communal_Space_Maintenance__c, Body__c, Active__c
      FROM Announcement__c
      WHERE
        Active__c = TRUE
        AND (Communal_Space_Maintenance__c = NULL
        OR (Communal_Space_Maintenance__c != NULL
        AND (Communal_Space_Maintenance__r.Maintenance_Start__c = NEXT_N_DAYS:7
        OR Communal_Space_Maintenance__r.Maintenance_Start__c <= TODAY)
        AND Communal_Space_Maintenance__r.Maintenance_End__c >= TODAY
        AND Communal_Space_Maintenance__c IN :maintenance))
    ];
  }
  @AuraEnabled(cacheable=false)
  public static void CreateAnnouncement(
    Date expireDate,
    String body,
    String maintenanceId
  ) {
    Announcement__c announcement = new Announcement__c();
    announcement.Expiration__c = expireDate;
    announcement.Body__c = body;
    announcement.Active__c = true;
    if (maintenanceId != null) {
      announcement.Communal_Space_Maintenance__c = maintenanceId;
    }
    insert announcement;
  }
  @AuraEnabled(cacheable=false)
  public static void CreateCSMaintenance(
    Datetime startDateTime,
    Datetime endDateTime,
    String body,
    Id communalSpaceId
  ) {
    Communal_Space_Maintenance__c maintenance = new Communal_Space_Maintenance__c();
    maintenance.Communal_Space__c = communalSpaceId;
    maintenance.Maintenance_Start__c = startDateTime;
    maintenance.Maintenance_End__c = endDateTime;
    insert maintenance;
    if (body != null) {
      CreateAnnouncement(endDateTime.date(), body, maintenance.Id);
    }
  }
}