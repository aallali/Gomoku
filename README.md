# 1337/42 - Gomuku v2.0
This project involves creating a Gomoku game integrating an AI player capable of beating a human player in the fastest way possible. To do this, you will implement a min-max algorithm but also do research, trial and error to find the most adapted heuristics.

---
## Game custom rules:

#### Patterns:

- **Free three** /or **Open Three** (both considered as free 3):
    - both sides are not blocked by the opponent's piece
        <p align="start">
            <img style="float:left;margin-right:10px"" src="./ressources/patterns/open3.png">
            <img src="./ressources/patterns/open3-2.png">
        </p>
---
- **Open Four**:
    - both sides are not blocked by the opponent's piece
        <p align="start">
            <img src="./ressources/patterns/open4.png">
        </p>

---
- **Capture move**:
    - in this case below, if 2 opponent's pieces are aligned in front of our piece and the next spot is available for us, then we can capture both pieces by playing B4
this move is called CAPTURE, if a player gets 5 captures (which means capturing 10 opponent's pieces) he wins
        <p align="start">
            <img style="float: left;margin-right:10px" src="./ressources/patterns/capture-setup.png">
            <img src="./ressources/patterns/capture.png">
        </p>
- **Forbidden in capture move**
    - as you can see in this example, white can't play in B3, because this is a capture move by default to black, so it's forbidden to play this move
    <img src="./ressources/patterns/in-capture.png">
---
- **Forbidden 2 open three**:
    - [img1] F5 is forbidden to play by black because it will form a double open3 pattern, which is not allowed by our rules.
    - [img2] this case is allowed to play F5 because the white piece is breaking of of the open3 patterns
    - [img3] it is allowed to have a double free three by a capture move.

        <p align="start">
            <img width="260px" src="./ressources/patterns/double-open3.png">
            <img width="260px" src="./ressources/patterns/broken-double-open3.png">
            <img width="260px" src="./ressources/patterns/allowed-double-open3.png">
        </p>
---
- **win conditions**:
    - 5 or more pieces in a row:
        - this is only considered a win if all pieces are not threatened to be captured by the opponent.
    <img src="./ressources/patterns/5win.png">
    - 5 captures, if a player reaches 5 captures, he is declared a winner.

---
### update 06/01/2024 :
- applied web workers to execute parallel minimax for all moves.
- Users can pick thinking time (`0.5`, `1`, `1.5`, `2`, `2.5`, `3` seconds) before starting a game.
validate input: at moves import.
- customize message when no moves to copy.
- heuristic score calculator function refactored
- comment out MiniMax methods
- more efficient performance time calculation for minimax run, eliminating before/after processes
- 👍 with think time >= 1 second, Ai played a very clean move, which is `K12`, an open 4 (split) `OXXX_X`, `O` can't play in the empty cell because it's forbidden for him (double open3), so X guaranteed a win after 1 move.
    - scenario: `J9,I8,I10,K8,H11,J8,H8,I7,I6,H6,I9,I8,I11,K9,K7,K10,H9,K12`
    <img src="/ressources/gomoku-v2.0-smart-move.png"/>
- handled the breakable lane by captures for these cases:
    - if P1 (player1) aligned more than >5 piece in row, and P2 have captures that cover this line:
    - I check if the captures cover pieces that will break the 5 in a row, or just the side, based on result i decide if the game stops or continues, so P2 can break it:
        - in scenario 2 where P2 has 2 captures for example:
            - capture 1: break the line in the middle
            - capture 2: take side pieces in the row, (doesn't break the line)
        - in this case, I let P2 play a move, and after I check if the most recent row of 5 made by P2 is broken or not.
---
### update 27/12/2023 :
 
2 days ago, I started implementing MiniMax. After some experimentation and algorithm refinement, it seems to work quite well so far. I improved the order for certain moves and fixed the best move chosen by the heuristic. Now, I need to work on how to handle scores inside MiniMax for more precise decisions.

~~Wins at level 1 are somewhat ignored, but it's not a big issue since it can be addressed before initiating a MiniMax search~~(**fixed**). However, all went well, Hamdullah.

Quick tips learned:
- Code slowly but organize it; it helps a lot in controlling the project's progression.
- Create all the utility/helper functions in a functional way (no dependency on external states); it aids in reusing and optimizing the code while keeping the logic in one place. `One fix == fix all`.
- Keep the cake for last; you eat it better.
- Writing the game in GO was a good decision, but jumping straight to MiniMax without having a good heuristic ruined it for me. I got overwhelmed quickly and gave up after 2 months of trying.

To-Do:
- [x] ⚠️ Important: It is important to note that it is not forbidden to introduce a
double-three by capturing a pair. ⚠️
- [x] Implement a quick fix for the moves sorter to handle instant win/block win.
- [x] Pause work on MiniMax and focus on cleaning/organizing the code.
- [x] Add missing/necessary functionalities for better UX.
- [ ] Create a test environment to detect breaking changes.
- [ ] try make the tests executable via the UI.
 

### update 17/12/2023 :
- Migrated the app to TypeScript/Vue 3.
- ~~Still under construction~~ 🚧 (100% of the work done).
- Optimization is progressing well so far, but there's room for more improvement.
- Wrote a move sorting algorithm based on properties calculated from the `MoveReport` class, such as `capture, block capture, open 4, block 3, alignment with other peers,... etc`. (still needs improvement).

- live here : https://gomoku.allali.me/
- Ai Analayse text area currentl contains only basic details. (will be updated)
- **TODO**:
    - [ ] ❌ (**Advanced**) _~~Include a scenario where:~~_
        - _~~There are three pieces in a row.~~_
        - _~~The fourth position is a forbidden cell for the opponent.~~_
        - _~~Place the fourth piece/move in the fifth position, which may be allowed for the opponent.~~_
        - _~~By doing so, we are one move away from achieving a five-in-a-row win, and the opponent cannot prevent it.~~_
    - [x] Implement limited-depth Minimax to check for any potential unhandled cases.
        - [x] experiment it a little bit
    - [x] implement moves import
    - [x] implement Undo move
    - [x] detect if the capture move will also break an open4/open3
    - [x] `[fix]`: all the moves considered "will be captured" are ignored even if a fifth (winning) capture move is there, adapt the script to bypass this one
    - [x] `[fix]`: set open3/open4 only if all the pieces forming it are not in a to-be-capture position
        - scenario: 
            - `B1,B2,B4,C1,A3,D0,C2,D3,A0,D2,D4`
        - [x] fix it for open3
        - [x] fix it for open4 
        - [x] fix it for block_open3
        - [x] fix it for block_open4
        - [ ] if you can improve that logic (that do the check above), that would be great (`priority:` `low`)
    - [x] `[fix]` : (**FIXED BY MINIMAX**) correct move for black is `K10` but it chose to block fifth move in open 4, which is lost any way, instead set up a capture that will break this win5 row and also make the fifth capture which is winnable
        - scenario : 
            - `J9,I8,I9,H9,J7,K9,G10,J8,I7,K7,L10,H7,H10,F10,I10,I7,J7,G7,H9,I8,J9,F11,G6,K8,K9,H11,K6,I8,L5,M11,J8,J9,J6,I6,L6,I5`
        - solution : 
            - always prioritize to break a win5 by capture/or setup capture.
                - can be open4
                - can be open4 split to 2 (`XX_XX`)
                - check for block win5 move first, then start checking for any capture that will block that

    - [x] `[check]`: still have captured to break the row of 5 but considered white as the winner
        - scenario : 
            - `I9,H8,H10,J8,G11,I8,G8,H7,H6,H9,G7,G6,J7,F5,E4,J9,J10,J9,G10,I8`
            - `I9,H8,H10,J8,G11,I8,G8,H7,H6,H9,G7,G6,J7,F5,E4,J9,G10,I8,H9,H7`
            - `I9,H8,H10,J8,G11,I8,G8,H7,H6,H9,G7,G6,J7,F5,E4,J9,J10,J9,G10,F4,F3,I8`
        - checked but nothing look wrong !!
    - [ ] _~~`[improve]` : best move is `F5` but chosed `F3`, not a bug actually, but if `F5` played, it will force the black to play F3 because it gonna block the win5, which is an "in-capture" move for him, so we gain a free capture~~_
        - ~~scenario :~~
            - _~~`B1,B2,B4,C1,A3,D0,C2,D3,A0,D2,D4,G5,B8,H6,B9,F4,E3,J8,I7,F2,B0,C5,A2,D2,E3,A4,D1,A1,E1,F1,F0,B10,B7,B5,D5`~~_
        - _~~how to solutions:~~_
            - _~~try to detect if a move will force bad move for opponent~~_
            - _~~try to reverse the process by finding the bad move for him, and check if it can be forced by making him play it to block an open4 or win5~~_

        unnecessary, an advanced move thinking, that requires a wide base of moves and in-depth check, my current version of Gomoku played a safer move in this case, played A5 and won against me after 17 moves by aligning 5 in a row and finished stats with 2(b)-4(w).
        - the rest moves history `A5,A6,A3,A2,F3,F5,I5,G7,J4,H7,F7,J6,K5,L6,H8,I3,I7`
        
    - [x] `[fix]`: black aligned  6 in a row, the opponent still had to capture the last rock, but even tho, it doesn't break the win 5, it should declare black as the winner directly
        - scenario:
            - `B1,B2,B4,C1,A3,D0,C2,D3,A0,D2,D4,G5,B8,H6,B9,B10,D1,E4,F4,E0,C0,F0,H0,I7,K9,A2,B7,B5,D3,D5,F3,G4,C6,E4,D5,D2,G3,E3,E2,D7,E5,E4,D6,H2,C7,A7,C7,B7`
        - solution:
when verifying if the opponent's captures are covering the row, we also have to check i the remaining pieces are forming a 5win row.
        - \+ also handled the case when there were multiple breaks, one of them broke the line and the other didn't, so if he picked the wrong capture, it would still consider the player who aligned >=5 in a row as the winner,
    - [x] `[fix]`: the white chose to block 5 in a row win, but that position is a capture for white if black played it, and white was one capture away to win, so just ignore him and play something better like setup capture since we have 4 captures in hand.
        - scenario:
            - `J9,I8,I9,H9,J7,K9,G10,J8,I7,K7,L10,H7,H10,F10,I10,I7,J7,G7,H9,I8,J9,F11,G6,K8,K9,H11,K6,I8,L5,M11,J8,J9,J6,I6,L6,I5,I4,I10,I9`
        - solution:
            - ~~try to find an adapted condition inside the sorter, **otherwise, just add custom condition for this case outside the scope**
            - I excluded this specific move for black, and let the sorter work normally
            ```ts
            const badWin5EnemyFilter = (l: THeuristic) => l.win5Block && l.captured_opponent
            if (
                player1Captures === 4 
                && player2Captures < 5 
                && moves.find(badWin5EnemyFilter)
            ){
                moves = moves.filter(l => !badWin5EnemyFilter(l))
            }
            ```

<img src="./ressources/gomoku-ts-v1.2.png">

---
### update 30/06/2023 (second day of AÏD AL ADHAA):

I started this project 1 year ago (March 2022, I think) as a school project. I began with a simple React app and attempted to implement the solver within it. I encountered performance issues, of course (you can't apply hardcore MiniMax in the browser, haha 😆). 
Well, I worked on it for a month or two, then put it on hold since no solution was clear at that time.


Recently, I revisited the project, this time developing the solver engine in the Go language for its speed, which proved to be quite fast. I implemented numerous algorithms and strategies, gaining valuable insights along the way. Unfortunately, the outcomes did not meet expectations. The algorithm was required to identify the optimal move in less than half a second, and my code lacked organization, coupled with subpar and inefficient heuristics. Faced with these challenges, I decided to abandon the project.

However, I gained significant insights into a technique known as NES (Natural Evolution Strategy). This method involves analyzing the board for potential threats or offensive moves. It works flawlessly for the standard "5 in a row" rule. However, in our scenario with custom rules (such as captures, restrictions on capturing moves, and the prohibition of moves forming a double-free three-shape), I had to devise a solution. After numerous retries and tests, I managed to develop the initial version. It took thousands of attempts to arrive at the optimal combination for this algorithm. I continue to refine it by playing more games against the AI.

The JavaScript algorithm operates in the browser with an accompanying UI shown in the image. Implemented using only HTML, CSS, and JavaScript—no frameworks—it utilizes a customized NES algorithm to efficiently choose optimal moves. Although the current functionality is strong, there's potential for further enhancements.

**13:34PM 32% Battery , i can hear the ADHAN (call for the prayer), by**

---
*`img updated: 29/07/2023`*
**Gomoku v1.0**

<img src="./ressources/gomoku-web-v4.1.png"/>

Todo: [**DEPRECATED** (check gomoku v2.0)]
- [x] : add support to switch modes (`1337 rules` && `normal`)
- [x] : support the startup game from the list of moves set in the '`Moves`' textarea
- [x] : add welcome animation at first load of page
- [x] : find and apply captures before running some checks inside the `AnalyseMoves(..)` function
- [x] : hover the 5 win pieces with bright color when the game ends
- [ ] : ~~prevent the game from ending when there still a move that can break tht 5 in row~~
- [x] : make the '`Ai Suggestion`' part functional by including the moves analyse in there
    - [ ] : ~~make the analyse more detailed~~
- [x] : organize the order of game start function to avoid conflicts.
    - [ ] : ~~refactor it~~
- [ ] : ~~improve algo to: if the oponent setup a capture, and you dont have any other good option to do except 'best by score', try to find if there is a possible move that will make the capture spot for him forbidden using 'forbidden in capture move' pattern.~~
- [x] : blink the captured pieces before removing them from board for more visibility
- [ ] : ~~add board score calculation function and implement it to UI~~
- [ ] : ~~fix the cases mentioned in history file~~


### update ?/03/2022
 
**gomoku v0** experimental app made in reactjs to play around.