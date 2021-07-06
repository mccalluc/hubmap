---
id: data-hosting
title: Hosting Data
sidebar_label: Hosting Data
slug: /data-hosting
---

Vitessce is a "serverless" tool, and can read data hosted in object stores or static web servers, such as AWS S3. In fact, this means that both the Vitessce viewer static web app and your data resources can be hosted in this way.

## AWS S3

When using AWS S3, you will need to ensure that your bucket objects are readable by the outside world.
Configure the following in your bucket's `Permissions` tab.

### Block public access (bucket settings)

- Block all public access: off

### Bucket Policy

For a bucket named `foo-bar`, you will need to add the following in `Permissions` > `Bucket policy`:

```json
{
  "Version": "2012-10-17",
  "Id": "Policy12345",
  "Statement": [
    {
      "Sid": "Stmt6789",
      "Effect": "Allow",
      "Principal": "*",
      "Action": [
        "s3:GetObject",
        "s3:GetObjectAcl",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::foo-bar",
        "arn:aws:s3:::foo-bar/*"
      ]
    }
  ]
}
```

:::tip
Remember to change `foo-bar` to your bucket name in the "Resource" field.
:::

### Cross-origin resource sharing (CORS)

Add the following CORS configuration to the bucket to allow files to be read from other domains.

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["Content-Range"],
    "MaxAgeSeconds": 3000
  }
]
```

## Google Cloud

First ensure that your bucket has fully public permissions for reading data - grant full read permissions to the user `allUsers` - then use the following cors config along with the command `gsutil cors set my-config.json gs://my-bucket`:

```json title="my-config.json"
[
  {
    "origin": ["*"],
    "responseHeader": [
      "Content-Type",
      "Accept-Ranges",
      "Content-Range",
      "Content-Encoding",
      "Content-Length",
      "Access-Control-Allow-Origin",
      "Access-Control-Allow-Methods",
      "Range"
    ],
    "method": ["OPTIONS", "GET", "HEAD"],
    "maxAgeSeconds": 3600
  }
]
```

<!--
## Zenodo

TODO
-->

## GitHub Pages

Simply add your data files to the `gh-pages` branch of your repository, enable GitHub Pages in the repository settings tab, and add a `.nojekyll` file to the root of the `gh-pages` branch.

Note: OME-TIFF files hosted on GitHub Pages are currently not supported, as GitHub Pages does not support HTTP requests with the `Range` header.

## Local

Before uploading data to a cloud object store, you may want to work with the data locally.
Vitessce supports local file URLs.
To serve data locally, any web server that can serve a directory should work, but we recommend [`http-server`](https://www.npmjs.com/package/http-server), which can be installed with Homebrew (on macOS) or NPM:

```sh
brew install http-server
# or
npm install --global http-server
```

Then, navigate to your data directory and run the server:

```sh
http-server ./ --cors -p 9000
```

And make sure that the `url` values in your Vitessce view config point to the local files:

```json
...,
"datasets": [
    {
        "uid": "my-dataset",
        "name": "My amazing dataset",
        "files": [
            {
                "type": "cells",
                "fileType": "cells.json",
                "url": "http://localhost:9000/path/to/my-local-file.json"
            }
        ]
    }
],
...
```
