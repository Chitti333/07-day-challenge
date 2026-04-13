give me a real world project scenario for each command to be used for every case.

what is git?

a terminal allows us to manipulate the file structure at command line only

commands to manipulate files:
- mkdir 
- ls
- cd 
- touch 
- 



git commands :
- git init - initializing a repository(confirm by using ls -a(show hidden)in command line)
- git status - to check the status .. files that are modified , added or deleted ..that are being tracked (the changes that are not saved in the history) in the repo right after you initialize repo - ur teammates should know that you made a change
- git add - put the unstaged files to staging area -index ( the files that needs to be saved)
- git commit - save all of the files in the staging area to history.
- git restore --staged file names ( remove from the staging area)
- git log - to see the history (commit history with timestamps)
- git reset <Commit id> - time travels to the commit id stage
- git stash - to go back to the previous state and try things and can come here whenever it needed 
- git stash clear  -clear that use later version 


git commands to share over internet
- git remote add origin <URL> - adds the url in the name of origin.
- git remote -v (shows the urls attached to our current folder)
- git push - push the changes to the url to be pushed and branch (origin main)

what is a master?

Branches : 


the git commit histories are connected in directed acyclic graph 

you should never commit on main branch in projects .. the code that is used by default - the unfinalized and unapproved code should not be pushed to main -  to avoid clutter and inconvinience

- git branch <new branch name> - to create a branch
- git checkout <branch name> - to change the workspace to branch 
- git merge <other branch while u r in current branch in which it is to be merged> - to merge with the current branch.

Working with existing projects
