# 6.6.1

- Small fix to make sure if there is a cost function or not, also fixed the variable name

# 6.6.0

- Improved Pathfinding [pf2e-astar](https://github.com/7H3LaughingMan/pf2e-astar)
  - All pathfinding is now handled via WebAssembly, this allows for record breaking pathfinding on even the largest of maps
- Added a setting to allow GMs to disable pathfinding for players
- Removed the teleport ability since the key binding for it will interfere with the drag measurement being added to PF2e

# 6.5.4

- Fix a problem with tiny tokens

# 6.5.3

- Reworked how the center grid is calculated for tokens that take up more than one square
- When starting, ending, or adding a waypoint it should always use the "center grid" when snapping is enabled

# 6.5.2

- Made some slight improvements to pathfinding
  - Always assume we are using 5-10-5 diagonal rules when calulating g
  - When calculating h get the actual distance to the end in grid units, also assume we are using 5-10-5 diagonal rules

# 6.5.1

- Fix an issue where pathfinding was being run on each individual client.
- Disabled pathfinding by default.

# 6.5.0

- Added basic pathfinding, this only works for that last segment of movement. Please note that this will freeze up Foundry when calculating a path, for shorter distances this probably won't be noticeable but for longer distances that are complex it will be noticeable.
- Fixed an issue where if you switch between snapping and non-snapping it would prevent the token from going back to a snapped position.
- Fixed an issue where if a token is in-between grid spaces it would think the token didn't take up any grid spaces, in these cases it now thinks the token takes up the grid located at the center of the token.

# 6.4.0

- Completly detatched Drag Ruler from Foundry's Ruler.
- Added the ability to "teleport" tokens by holding Ctrl. Any distance travelled while teleporting does not count as movement.
- Added the ability to skip the movement animation by holding Alt.
- Reworked how the direct path for a segment is calculated.
- Fixed a bug that prevent players from moving their token in combat if the GM moved their token through a wall.

# 6.3.0

- Added the ability to right-click to either Add Waypoints, Remove Waypoints, or cancel the Drag Ruler.
- Added a new key binding that allows you to cancel the drag ruler via Escape, this can't be edited.
- Changed the default key/mouse bindings
  - Space -> Add Waypoint
  - Right-Click -> Remove Waypoint

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