Este arquivo explica como Visual Studio criou o projeto.

As seguintes ferramentas foram usadas para gerar este projeto:
- Angular CLI (ng)

As etapas a seguir foram usadas para gerar este projeto:
- Crie um projeto angular com ng: `ng new TeambookMM --defaults --skip-install --skip-git --no-standalone `.
- Atualize angular.json com a porta.
- Criar o arquivo de projeto (`TeambookMM.esproj`).
- Crie `launch.json` para habilitar a depuração.
- Atualize package.json para adicionar `jest-editor-support`.
- Atualize `start` o script no `package.json` para especificar o host.
- Adicionar `karma.conf.js` para testes de unidade.
- Atualize `angular.json` para apontar para `karma.conf.js`.
- Adicionar projeto à solução.
- Grave este arquivo.
