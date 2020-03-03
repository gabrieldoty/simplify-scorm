# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## 2.0.0

### Added

- This CHANGELOG file to document changes to the project
- The `reset` method should now be used instead of the previous
  `replaceWithAnotherScormAPI` method. It resets the API to its original state
  cleanly, instead of having to create a whole new API.

### Removed

- The `replaceWithAnotherScormAPI` method was removed. It caused issues with
  SCOs that keep a pointer to the original API after replacing it a few times.
