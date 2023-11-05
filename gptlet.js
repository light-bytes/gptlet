
javascript:(async function(){
    try{

        document.body.innerHTML="";
        document.head.innerHTML="";
        document.body.style.margin='0';
        document.write(`
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
<style>body{font-family:"Roboto",system-ui,-apple-system,"Segoe UI","Helvetica Neue","Noto Sans","Liberation Sans",Arial, sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";}
</style>
<div id="main" style="
display: flex;
height: 100%;
flex-direction: column;
">
<div id="menuwrapper" style="
    background: grey;
    position: relative;
    padding: .5rem;
    display: flex;
    ">
    <div id="resetbutton" style="padding: 1rem;background: darkgrey;text-align: center;border-radius: .5rem;">Reset
    </div>      
    <div id="apikeybutton" style="padding: 1rem;background: darkgrey;text-align: center;border-radius: .5rem;margin-left: 1rem;">set api key
    </div>   
    </div>

    <div id="chatArea" style="
    background: whitesmoke;
    position: relative;
    overflow-y: scroll;">
    <div id="gptchat" style="
        background: whitesmoke;
        display: flex;
        position: relative;
        flex-direction: column-reverse;
        padding: 1rem;
    ">
    <div style="height: 20rem;"></div>
    </div>
    </div>

    <div id="chatInput" style="
    background: grey;
    padding: 1rem;
    display: flex;
    "><input id="promptinput" style="
    font-size: 1rem;width: 100%;border: 1px solid black;
    border-radius: .5rem;padding: .5rem;" 
    placeholder="Ask something...">
        <div id="send" style="margin-left: 1rem;background: darkgrey;padding: 1rem;border-radius: .5rem;">send</div>
    </div>
</div>
`);
        var conversationHistory = [];
        const storedConversation = localStorage.getItem('conversationHistory');
        console.log(storedConversation);
        function newHistory() {
            conversationHistory=[{ role: 'system', content: 'You are a helpful assistant.' }];
            localStorage.removeItem('conversationHistory');
            localStorage.setItem('conversationHistory', conversationHistory);
        };
        if(storedConversation){
            if(storedConversation !== '[object Object]'){
                conversationHistory=JSON.parse(storedConversation);
            } else {
                newHistory();
            };
        } else {
            newHistory();
        };
        var apiKey="";
        var storedApiKey=localStorage.getItem('gptlet_apikey');
        if(storedApiKey){
            apiKey= storedApiKey;
        };
        var gptchat=document.getElementById('gptchat');
        var input=document.getElementById('promptinput');
        var apikeybutton=document.getElementById('apikeybutton');
        var resetbutton=document.getElementById('resetbutton');
        var chatArea=document.getElementById('chatArea');
        input.addEventListener('focus',(e)=>{
            e.preventDefault();
        });
        async function addBubble(type, text){
            var bubble=document.createElement('div');
            bubble.style.background='darkgrey';
            bubble.style.padding='1rem';
            bubble.style.borderRadius='.5rem';
            bubble.style.marginTop='1rem';
            if(type==='user') {
                var ii = document.createElement('i');
                ii.className='fa-solid fa-user';
                bubble.textContent='  ' + text;
                bubble.prepend(ii);
            } else {
                var ii = document.createElement('i');
                ii.className='fa-solid fa-robot';
                bubble.textContent='  ' + text;
                bubble.prepend(ii);
            };
            gptchat.prepend(bubble);
            chatArea.scrollTop = chatArea.scrollHeight;
        };
        async function callGPT(messages){
            if(!apiKey){
                apiKey = prompt('⚠️ERROR: No OpenAi API key was set.\n\nPlease set a key now:');
                localStorage.setItem('gptlet_apikey',apiKey);
            };
            var data = JSON.stringify({
                "model": "gpt-3.5-turbo",
                "messages": messages,
                "temperature": 1,
                "max_tokens": 256,
                "top_p": 1,
                "frequency_penalty": 0,
                "presence_penalty": 0
            });
            var response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer '+apiKey,
                },
                body: data,
            });
            var responseData = await response.json();
            console.log(responseData);
            var assistantReply = responseData.choices[0].message.content;
            conversationHistory.push({ role: 'assistant', content: assistantReply });
            localStorage.setItem('conversationHistory', JSON.stringify(conversationHistory));
            await addBubble('gpt', assistantReply);
            chatArea.scrollTop = chatArea.scrollHeight;
        };
        document.getElementById('send').addEventListener('click', async () => {
            const userMessage = input.value;
            input.value='';
            if (userMessage.trim() !== '') {
                conversationHistory.push({ role: 'user', content: userMessage });
                await addBubble('user', userMessage);
                await callGPT(conversationHistory);
                localStorage.setItem('conversationHistory', JSON.stringify(conversationHistory));
            }
            chatArea.scrollTop = chatArea.scrollHeight;
        });
        apikeybutton.addEventListener('click',()=>{
            apiKey = prompt('🟩Please set your OpenAi API key now.');
            localStorage.setItem('gptlet_apikey',apiKey);
        });
        resetbutton.addEventListener('click',()=>{    
            conversationHistory=[{ role: 'system', content: 'You are a helpful assistant.' }];
            localStorage.removeItem('conversationHistory');
            localStorage.setItem('conversationHistory', conversationHistory);
            gptchat.textContent='';
            var j=document.createElement('div');
            j.style.height='20rem';
            gptchat.appendChild(j);
            chatArea.scrollTop = chatArea.scrollHeight;
        });
        if(conversationHistory.length>0){
                for(const message of conversationHistory){
                    if(message.role != 'system') {
                        addBubble(message.role, message.content);
                    }
                }
                chatArea.scrollTop = chatArea.scrollHeight;
            };
    }catch(error){
      alert(error);
    }
}());
