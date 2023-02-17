trigger ContentVersionExternalLink on ContentVersion (after insert) {
    ContentTriggerHandler.createPublicLinkForFile(trigger.new);
}