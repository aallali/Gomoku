# 42-Gomuku
This project involves creating, in the language of your choice, a Gomoku game integrating an AI player capable of beating a human player the fastest way possible. To do this, you will implement a min-max algorithm but also do research, trial and error to find the most adapted heuristics. This will not be as easy as checkers. 

---

### update 17/12/2023 :
- Migrated the app to TypeScript/Vue 3.
- Still under construction 🚧 (60% of the work done).
- Optimization is progressing well so far, but there's room for more improvement.
- Wrote a move sorting algorithm based on properties calculated from the `MoveReport` class, such as `capture, block capture, open 4, block 3, alignment with other peers,... etc`. (still needs improvement).

- live here : https://gomoku.allali.me/
- Ai Analayse text area currentl contains only basic details. (will be updated)
- **TODO**:
    - [ ] Include a scenario where:
        - There are three pieces in a row.
        - The fourth position is a forbidden cell for the opponent.
        - Place the fourth piece/move in the fifth position, which may be allowed for the opponent.
        - By doing so, we are one move away from achieving a five-in-a-row win, and the opponent cannot prevent it.
    - [ ] Implement limited-depth Minimax to check for any potential unhandled cases.
        - [x] experiment it a little bit
    - [x] implement moves import
    - [x] implement Undo move
    - [x] detect if the capture move will also break an open4/open3
    - [ ] `[fix]` : all the moves considered "will be captured" are ignore even if a fifth (winning) capture move is there, adapt script to bypass this one
<img src="./ressources/gomoku-ts-v1.png">

---
### 30/06/2023 (second day of AÏD AL ADHAA):

I started this project 1 year ago (March 2022, I think) as a school project. I began with a simple React app and attempted to implement the solver within it. I encountered performance issues, of course (you can't apply hardcore MiniMax in the browser, haha 😆). 
Well, I worked on it for a month or two, then put it on hold since no solution was clear at that time.


Recently, I revisited the project, this time developing the solver engine in the Go language for its speed, which proved to be quite fast. I implemented numerous algorithms and strategies, gaining valuable insights along the way. Unfortunately, the outcomes did not meet expectations. The algorithm was required to identify the optimal move in less than half a second, and my code lacked organization, coupled with subpar and inefficient heuristics. Faced with these challenges, I decided to abandon the project. 
 
But, i gained significant insights into a technique known as NES (Natural Evolution Strategy). This method involves analyzing the board for potential threats or offensive moves. It works flawlessly for the standard "5 in a row" rule. However, in our scenario with custom rules (such as captures, restrictions on capturing moves, and the prohibition of moves forming a double free three shape), I had to devise a solution. After numerous retries and tests, I managed to develop the initial version. It took thousands of attempts to arrive at the optimal combination for this algorithm. I continue to refine it by playing more games against the AI.

The JavaScript algorithm operates in the browser with an accompanying UI shown in the image. Implemented using only HTML, CSS, and JavaScript—no frameworks—it utilizes a customized NES algorithm to efficiently choose optimal moves. Although the current functionality is strong, there's potential for further enhancements.

**13:34PM 32% Battery , i can hear the ADHAN (call for the prayer), by**

---
*`img updated: 29/07/2023`*
<img src="./ressources/gomoku-web-v4.1.png">

Todo:
- [x] : add support to switch modes (`1337 rules` && `normal`)
- [x] : support startup game from list of moves set in the '`Moves`' textarea
- [x] : add welcome animation at first load of page
- [x] : find and apply captures before running some checks inside the `AnalyseMoves(..)` function
- [x] : hover the 5 win pieces with bright color when the game ends
- [ ] : prevent the game from ending when there still a move that can break tht 5 in row
- [x] : make the '`Ai Suggestion`' part functional by including the moves analyse in there
    - [ ] : make the analyse more detailed
- [x] : organize the order of game start function to avoid conflicts.
    - [ ] : refactor it
- [ ] : improve algo to: if the oponent setup a capture, and you dont have any other good option to do except 'best by score', try to find if there is a possible move that will make the capture spot for him forbidden using 'forbidden in capture move' pattern.
- [x] : blink the captured pieces before removing them from board for more visibility
- [ ] : add board score calculation function and implement it to UI
- [ ] : fix the cases mentioned in history file 

