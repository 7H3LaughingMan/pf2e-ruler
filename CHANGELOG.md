# 6.2.0

- Created a custom DragRuler class, now this module won't interfere with the built-in ruler
- Prevent possible multiple instances of the drag ruler, if another one of your instances is moving a token and you attempt to move another token it will default back to the regular token dragging.

# 6.1.0

- Renamed from PF2e Ruler to PF2e Token Drag Ruler
- Added scene control which can be used to toggle the drag ruler on or off
- If multiple tokes are selected the drag ruler will not be created

# 6.0.0

- Initial Public Release!

# 6.0.0-rc.3

- Added a setting to control when to highlight a token's speed. Always, Combat Only, or Never.
- Limit available actions to tokens based on conditions.
  - If a token is Immobilized, Paralyzed, Petrified, or Unconcious they will have no actions.
  - If a token is a minion their base number of actions is 2, everything else has a base number actions of 3.
  - If a token is quickened their base number of actions is increated by 1.
  - If a token is stunned/slowed it will reduce their number of actions by the greater of the two. This only applies when the token is in combat. This is also compatible with PF2'e Workbench auto-reduction of the stunned condition at the start of a token's turn.
  - There is a setting to disable the reduction of actions based on the stunned/slowed condition in combat.

# 6.0.0-rc.2

- Fixed a problem with the ruler not calculating distances properly.

# 6.0.0-rc.1

- Added combat movement tracking, at the start of a token's turn it will clear their movement history. To delete a token's movement history manually right-click on it in the encounter tracker. You will only see the option to delete a token's movement history if the token has a movement history.
- Enabled noclip for GMs

# 6.0.0-alpha.6

- Forgot to include styles!

# 6.0.0-alpha.5

- Don't show token speed highlighting unless the user is an observer of the token.
- However, there is a setting to show token speed highlighting for any token's owned by a player. So if the token belongs to a player they will see the token speed highlighting even if they aren't an observer.
- Added a setting to hide a GM's ruler based on the token's disposition. By default it's set to only show the GM's ruler if the token is friendly to the party.

# 6.0.0-alpha.4

- Allow adjusting the color of the different categories for speed highlighting.
- Wrap the built-in ruler instead of extending it.

# 6.0.0-alpha.3

- Added token speed highlighting! This is very basic and you can't change the colors, and it will display all four stride actions for every token.

# 6.0.0-alpha.2

- Make sure we include the languages folder!

# 6.0.0-alpha.1

- This is the first public pre-release for PF2e Ruler. At the moment when you attempt to drag a  token it will automatically start using the ruler to measure the distance you are moving the token. You can add waypoints using the equals button and remove waypoints by using the minus button. If you want to cancel the movement you can right-click.