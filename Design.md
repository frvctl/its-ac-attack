![Screen Shot of Proposed Multiplayer Design](https://github.com/EpicCodez/its_ac_attack/raw/master/multiplayer.png)

The Design
================

*
----------------------
The buzzer will be a central point of the entire multiplayer mode.
Once a user that is in the multiplayer section hits the button that
user gets a set amount of time to answer the question.

When the buzzer is pressed the following has to happen:
  * All other users must be informed that someone buzzed and who
    that person is
  * The buzzer must become innert for all other users
  * The reading must stop as soon as the buzzer is pressed
  * An answer form must appear for the user who answered the question

There are several possible outcomes after the buzzer is pressed: 
  * If the user does not answer it within the set amount of time:
    * If it interrupted the reading then points are deducted
      * Then all other users are informed and the question continues 
        to be read
      * The user who pressed the buzzer can no longer answer
    * If it does not interrupt the reading no points are deducted
      * All other users are informed and the time limit resumes for 
        the answering of the overall question.
      * The user who pressed the buzzer can no longer answer the 
        question
  * If the user answers correctly:
    * Points are scored to the user
    * All other users are informed
    * The next question is presented
  * If the user does not answer correctly:
    * Points are deducted if the reading was interrupted
      * All other users are informed and the question resumes also
        the user who answered incorrectly can no longer answer
    * Points are not deducted if the reading was not interrupted
      * All other users are informed and the user who answered
        incorrectly can no longer answer

**
------------------------
The skip button will be a democratic vote system - also admin users
will be able to override this and force a skip - if the majority of
those playing wish to skip the question then it gets skipped.

***
-----------------------
For multiplayer this will not be totally selectable by any one person
except for admins. The way it will work is there will be modes that can be voted on. For example one mode will be random, another will be
history only, another will be science and history, ect, ect. There will also be the option to hide this panel on a by user basis. Once minimized the question readout area will expand accordingly

****
-----------------------
This will function like any other messanging system and there will be the option to hide it if that is what the user wants. All users in the multiplayer chat will be displayed at the top. Once minimized the question readout area will expand accordingly.