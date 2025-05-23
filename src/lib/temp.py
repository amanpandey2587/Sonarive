
from openai import OpenAI

YOUR_API_KEY = "process.env.SONAR_API_KEY"

messages = [
    {
        "role": "system",
        "content": (
            "You are an artificial intelligence assistant and you need to "
            "provide the one word answer of the user requests."
        ),
    },
    {   
        "role": "user",
        "content": (
            "What is the capital of France?"
        ),
    },
]

client = OpenAI(api_key=YOUR_API_KEY, base_url="https://api.perplexity.ai")

# chat completion without streaming
response = client.chat.completions.create(
    model="sonar-pro",
    messages=messages,
)
print(response)

# chat completion with streaming
response_stream = client.chat.completions.create(
    model="sonar-pro",
    messages=messages,
    stream=True,
)
for response in response_stream:
    print(response)