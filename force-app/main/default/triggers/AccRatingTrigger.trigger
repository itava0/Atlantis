trigger AccRatingTrigger on AccRating__c (after insert, after update, before delete) {
    // Insert or Update an Account Rating
    if (Trigger.isInsert || Trigger.isUpdate) {
        AccRatingUpdateInsert.AccRatingUpdatedInserted(Trigger.new);
    }
    // Delete a Rating
    if (Trigger.isDelete) {
        AccRatingDelete.AccRatingDeleted(Trigger.old);
    }
}