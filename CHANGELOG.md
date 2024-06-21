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