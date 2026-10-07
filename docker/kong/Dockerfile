# Kong gateway with the declarative config baked in. API keys are substituted
# from the environment at start-up.
FROM kong:2.8.1
COPY kong.yml /home/kong/temp.yml
ENTRYPOINT ["bash", "-c", "eval \"echo \\\"$(cat ~/temp.yml)\\\"\" > ~/kong.yml && /docker-entrypoint.sh kong docker-start"]
