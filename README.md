# Canutin: desktop

<img width="1495" alt="image" src="https://user-images.githubusercontent.com/1434675/201496760-84c132ba-9685-4313-8668-9d72fd52537b.png">

<p align="center">
  ⚡ <strong>Live demo <a href="https://demo.canutin.com/">https://demo.canutin.com</a></strong><br/>
  <em>(data will be wiped frequently)</em>
</p>

---

- [What is Canutin?](#what-is-canutin)
- Install...
  - [💻 Desktop (macOS, Windows, Linux)](#install-macos-windows--linux)
  - [📦 Server (Docker)](#install-docker)
- [Getting data in](#getting-data-in)
- [Frequenty asked questions](#frequenty-asked-questions)
- [Contributing](#contributing)
- [Development](#development)

## What is Canutin?

- Canutin is a desktop app for managing your personal finances.
- It consolidates all your accounts, transactions and assets in one place and tracks them over time.
- Runs entirely on your computer and stores your data locally.
- It's open source, free to use and available for Windows, macOS & Linux.
- Allows you to import accounts, assets and transactions [via API](#getting-data-in).
- No sign up is required.

## Install (macOS, Windows & Linux)

1. Begin by downloading the [latest release](https://github.com/Canutin/desktop/releases) for your operating system.
2. Run the installer and follow the instructions.
3. Once the installation is complete, you can run the app from your applications menu\*
4. The first time you run the app you'll be asked to create a new _vault_. This is where your data will be stored.
5. After your vault is set, Canutin will open as a new tab in default browser and you'll be ready to start using the app 🎉
6. **If you close the tab** you can re-open it again by looking for the Canutin icon in your tray bar and clicking `Open in browser` or by visiting [`http://localhost:42069`](http://localhost:42069).

### \* Note for Windows and macOS users

Canutin hasn't paid the _app-store tax_ that Microsoft and Apple require to _notarize_ the app, this means that when you first run it you'll see a warning that it's from an _"unidentified developer"_. Follow these steps to get the app running:

- **On Windows**: On the warning screen click on `More info` and then `Run anyway`.
- **On macOS**: After you see `Canutin.app cannot be opened because the developer cannont be verified`, click `Cancel`, then head over to `System Preferences > Security & Privacy` and click `Open Anyway`.

You might need to do this step again in the future when you update the app.

# Install (Docker)

Run the command below, then visit [http://localhost:42069](http://localhost:42069).

```shell
docker run -d \
  --name canutin \
  -p 42069:42069 \
  -v ./vaults:/canutin/vaults \
  --restart=unless-stopped \
  ghcr.io/fmaclen/canutin:latest
```

Or create a `docker-compose.yml` file:

```yaml
version: '3'
services:
  canutin:
    image: ghcr.io/fmaclen/canutin:latest
    container_name: canutin
    ports:
      - "42069:42069"
    volumes:
      - ./vaults:/canutin/vaults
    restart: unless-stopped
    # Optional environment variables
    environment:
      HOST: "0.0.0.0"
      PORT: "42069"
      SHOULD_CHECK_VAULT: "true"
      DATABASE_URL: "file:../vaults/Canutin.vault"
```

And then run `docker compose up -d`.

## Getting data in

There's multiple ways to get data into Canutin, these are available from the **Add or update data** page.

- **By hand:** you can add or edit any account, transaction or asset manually like you would if you used a spreadsheet.
- **Importing via API:** at the moment this process requires some degree of technical knowledge but it allows you to import data from other apps or services, for example by scraping the data from your bank's website. You can find more information and examples in the **[API documentation](docs/API.md)**.
- **Importing from CSV:** _This is currently planned but not yet available_. If you'd like this feature to be prioritized, comment or upvote [this issue](https://github.com/Canutin/desktop/issues/74).

## Frequenty asked questions

- **Can I use Canutin on my phone?**
  At the moment Canutin only runs on desktop operating systems, though a mobile app is in the roadmap.

- **How do I share data between devices?**
  The simplest way to do this is to use a cloud storage service like Dropbox or Google Drive. You can then set up Canutin to use that folder as the vault location. This way you can access the same data from multiple devices.

- **How do I backup my data?**
  All of the data Canutin interacts with is stored in a single file (referred to as a Vault file). You can backup this file the same way you would any other file on your computer.

- **What about security?**
  In it's current version Canutin does not encrypt your data though that is in the roadmap. Canutin is as secure as your computer is, anyone who has access to your device will be able to access the data in the vaults stored in such device. By default Canutin's server is only accessible from your computer's browser but it's possible to expose it to your local network and/or the public Internet if your networking settings allow it.

- **What about privacy?**
  The data is stored locally in your device. Canutin does not collect any data about you or your usage of the app and does not contain any kind of telemetry or analytics.

- **How do you make money?**
  We don't. Canutin is a hobby project at the moment.

## Development

If you are interested in extending what Canutin can do, take a look at the [development documentation](docs/DEVELOPMENT.md).

## Contributing

Here's ways in which you can contribute:

- Found a **bug** or have a **feature request**?
  1. Search for it in the [existing issues](https://github.com/canutin/desktop/issues)
  2. Open a [new issue](https://github.com/canutin/desktop/issues/new) if it doesn't yet exist
- Comment or upvote [existing issues](https://github.com/canutin/desktop/issues) _(active issues will likely be prioritized)_
- Submit a [pull request](https://github.com/canutin/desktop/pulls) _(please discuss in an issue first)_
