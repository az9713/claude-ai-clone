https://www.youtube.com/watch?v=lt-wKINAMuw

https://github.com/anthropics/claude-quickstarts/blob/main/autonomous-coding/prompts/app_spec.txt

build claude ai clone
plan mode

a lot of work
better way
> "Hey there, I need you to create a detailed implementation plan based on the following app spec file. This is what I need you to do: in the root of the project, I'm going to create a specs folder. Within that specs folder, create a subfolder for this new feature that we're trying to implement. It's based on this app spec file that I'm going to share with you."


he said break up the features
figure out the dependencies of the features
"Hey there, I need you to create a detailed implementation plan based on the following app spec file. This is what I need you to do: in the root of the project, I'm going to create a specs folder. With Inatspec's folder, create a subfolder for this new feature that we're trying to implement. It's based on this app spec file that I'm going to share with you. Now this is the important part. I need you to split up this implementation into different features, and I also need you to figure out the dependency between the different features. We do want to hand all of this work over to several developers or coding agents."



<APP>
paste the app_spec.txt
</APP>


I just asked CC to read the transcrkipt and the app_spec.txt
CC now will do waves
but does CC break up the dependencies 
will ask CC


he said use only 4 % of context used <-- the planning? 4% for what
now see F1-F19 spec files
are these 19 waves ??


###
now compare new and old process
old way 
enter planning mode
requirement tech-stack provided
agent -> impl plan
background 
large complex project

that 

come up with impl plan
split it up to features 1,2,3...
small chuncks
each complete in single session
sequentially


large project
200-300 features
600 features
ralphloop - not for 100s
compact issue


group features
closely related
same files / parts
group into 1 wave
CC impl this wave

but with many features 3 or more feature
will exceed c/w for first few features in the same wave
3rd feature already exceed cw in wave


large cw less problem
5x feagtrues in a wave
these 5x features grouped due to same files 
efficient for cc to make changes
as these files are in memory

that is what the parallel wave done earlier by CC

he said 
Wave 1 has 5 features
Wave 3 has 6 features


now he said use agent team feature (for each wave??)
they implement waves in //

talk to each other
.claude/settngs.json
paste that env variable
does he need to restart CC
/exit

claude-yolo
drag the spec fold !!
> 
c:\claude_code\1m-context\specs\claude-ai-clone
all F0-F19 features
there is a READSME file with the wave info for each feature

he use \
for new line

"I need you to create an agent team that will implement all of these waves in parallel, so each agent should be responsible for implementing a wave. These agents need to be able to communicate with each other and work together to build this application. I also wanted to introduce any testing agents or QA experts that might be involved, as well as a devil's advocate agent. Let Paul question the quality of work and ensure that we produce a production-worthy app."


spawn 8 agents
see
Paul: Devil's Advocate ...


/btw


each team member has a cw limited to 200K tokens
each tema member still may compact
<-- but did he say 5x  ... i thought for each team member??

[autoforge, autoamaker, autoclaude
also did this dependcency brakup...
1-2 features/agent
with larget cw bump up 3 feature before, now 5x now 15 feature in single session
10 feature per session
agent has view of all file to change
no discovery phase 
a lot more features
]

@qa
@paul


agent crashed
do nt worry
main agent will kick off agant


let team run...


large cw
good for migration project




mvp stack use old framework
product
migration massive 400 feature to diff techstack
tricky
cc now holistic view
exceed cw
brak into small chunks
like this
migrate across
compact
lost details
70% migrated
30% dropped functionality

mass cw
not need to chunk small size


DONE



