// @ts-check
// 注: 型アノテーションにより、型チェックと IDE のオートコンプリートが可能になります。

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Cardano Developers Japan',
  tagline: 'カルダノジャパン開発者ポータルサイト',
  favicon: 'img/favicon.ico',

  // ここにサイトの実稼働 URL を設定します
  url: 'https://your-docusaurus-test-site.com',
  // サイトが提供される /<baseUrl>/ パス名を設定します
  // GitHub ページのデプロイメントの場合、通常は「/<プロジェクト名>/」です。
  baseUrl: '/',

  // GitHub ページのデプロイメント構成
  // GitHub ページを使用していない場合、これらは必要ありません
  organizationName: 'Cardano Developers Japan', // 通常は、GitHub 組織/ユーザー名です。
  projectName: 'Cardano Developers Japan', // 通常はリポジトリ名です。

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // 内部化を使用しない場合でも、このフィールドを使用して便利な設定を行うことができます。
  // HTML言語のようなメタデータ。 たとえば、サイトが中国語の場合、次のようにすることができます。
  // 「en」を「zh-Hans」に置き換えます。
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // これをリポジトリに変更してください。
          // 「このページを編集」リンクを削除するには、これを削除します。
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          // これをリポジトリに変更してください。
          // 「このページを編集」リンクを削除するには、これを削除します。
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // プロジェクトのソーシャル カードに置き換えます
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'Cardano Developers Japan',
        logo: {
          alt: 'Cardano Developers Japan Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'right',
            label: 'Tutorial',
          },
          {to: '/blog', label: 'Blog', position: 'right'},
          {
            href: 'https://github.com/facebook/docusaurus',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Tutorial',
                to: '/docs/intro',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Discord',
                href: 'https://discord.gg/sFZuV7m3X3',
              },
              {
                label: 'X (Twitter)',
                href: 'https://twitter.com/docusaurus',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/btbf/Cardano-Developers-Japan',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Cardano Developers Japan`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
