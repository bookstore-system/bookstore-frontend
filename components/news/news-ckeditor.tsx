/**
 * Shared CKEditor 5 (Decoupled) for news create/edit.
 * License + Cloud Services URLs from NEXT_PUBLIC_* env (see .env.example).
 */

"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { CKEditor } from "@ckeditor/ckeditor5-react"
import {
  Alignment,
  Autoformat,
  AutoImage,
  AutoLink,
  Autosave,
  BalloonToolbar,
  BlockQuote,
  Bold,
  Bookmark,
  CKBox,
  CKBoxImageEdit,
  CloudServices,
  Code,
  CodeBlock,
  DecoupledEditor,
  Emoji,
  Essentials,
  FindAndReplace,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  Fullscreen,
  Heading,
  HorizontalLine,
  ImageBlock,
  ImageCaption,
  ImageInsert,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  LinkImage,
  List,
  ListProperties,
  MediaEmbed,
  Mention,
  Minimap,
  PageBreak,
  Paragraph,
  PasteFromOffice,
  PictureEditing,
  RemoveFormat,
  SpecialCharacters,
  SpecialCharactersArrows,
  SpecialCharactersCurrency,
  SpecialCharactersEssentials,
  SpecialCharactersLatin,
  SpecialCharactersMathematical,
  SpecialCharactersText,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TextTransformation,
  TodoList,
  Underline,
} from "ckeditor5"
import {
  AIChat,
  AIEditorIntegration,
  AIQuickActions,
  AIReviewMode,
  Comments,
  DocumentOutline,
  Footnotes,
  FormatPainter,
  LineHeight,
  Pagination,
  PasteFromOfficeEnhanced,
  SlashCommand,
  TableOfContents,
  TrackChanges,
  TrackChangesData,
  TrackChangesPreview,
} from "ckeditor5-premium-features"
import "ckeditor5/ckeditor5.css"
import "ckeditor5-premium-features/ckeditor5-premium-features.css"
import "@/app/news/create/ckeditor-styles.css"
import "./news-ckeditor-supplement.css"

const LICENSE_KEY = process.env.NEXT_PUBLIC_CKEDITOR_LICENSE_KEY ?? ""
const CLOUD_SERVICES_TOKEN_URL = process.env.NEXT_PUBLIC_CKEDITOR_TOKEN_URL ?? ""
const CLOUD_SERVICES_WEBSOCKET_URL = process.env.NEXT_PUBLIC_CKEDITOR_WEBSOCKET_URL ?? ""

if (typeof window !== "undefined") {
  if (!LICENSE_KEY) {
    console.warn("[news-ckeditor] NEXT_PUBLIC_CKEDITOR_LICENSE_KEY chưa được set")
  }
  if (!CLOUD_SERVICES_TOKEN_URL) {
    console.warn("[news-ckeditor] NEXT_PUBLIC_CKEDITOR_TOKEN_URL chưa được set")
  }
  if (!CLOUD_SERVICES_WEBSOCKET_URL) {
    console.warn("[news-ckeditor] NEXT_PUBLIC_CKEDITOR_WEBSOCKET_URL chưa được set")
  }
}

const DEFAULT_HEX_COLORS = [
  { color: "#000000", label: "Black" },
  { color: "#4D4D4D", label: "Dim grey" },
  { color: "#999999", label: "Grey" },
  { color: "#E6E6E6", label: "Light grey" },
  { color: "#FFFFFF", label: "White", hasBorder: true },
  { color: "#E65C5C", label: "Red" },
  { color: "#E69C5C", label: "Orange" },
  { color: "#E6E65C", label: "Yellow" },
  { color: "#C2E65C", label: "Light green" },
  { color: "#5CE65C", label: "Green" },
  { color: "#5CE6A6", label: "Aquamarine" },
  { color: "#5CE6E6", label: "Turquoise" },
  { color: "#5CA6E6", label: "Light blue" },
  { color: "#5C5CE6", label: "Blue" },
  { color: "#A65CE6", label: "Purple" },
]

export interface NewsCKEditorProps {
  value: string
  onChange: (data: string) => void
}

export default function NewsCKEditor({ value, onChange }: NewsCKEditorProps) {
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const editorMenuBarRef = useRef<HTMLDivElement>(null)
  const editorToolbarRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const editorOutlineRef = useRef<HTMLDivElement>(null)
  const editorAnnotationsRef = useRef<HTMLDivElement>(null)
  const editorMinimapRef = useRef<HTMLDivElement>(null)
  const editorCkeditorAiRef = useRef<HTMLDivElement>(null)
  const [isLayoutReady, setIsLayoutReady] = useState(false)

  useEffect(() => {
    setIsLayoutReady(true)
    return () => {
      setIsLayoutReady(false)
      if (editorMenuBarRef.current) editorMenuBarRef.current.innerHTML = ""
      if (editorToolbarRef.current) editorToolbarRef.current.innerHTML = ""
      if (editorOutlineRef.current) editorOutlineRef.current.innerHTML = ""
      if (editorAnnotationsRef.current) editorAnnotationsRef.current.innerHTML = ""
      if (editorMinimapRef.current) editorMinimapRef.current.innerHTML = ""
      if (editorCkeditorAiRef.current) editorCkeditorAiRef.current.innerHTML = ""
    }
  }, [])

  const { editorConfig } = useMemo(() => {
    if (
      !isLayoutReady ||
      !editorCkeditorAiRef.current ||
      !editorOutlineRef.current ||
      !editorAnnotationsRef.current ||
      !editorMinimapRef.current
    ) {
      return { editorConfig: null as Record<string, unknown> | null }
    }

    return {
      editorConfig: {
        licenseKey: LICENSE_KEY,
        toolbar: {
          items: [
            "undo",
            "redo",
            "|",
            "previousPage",
            "nextPage",
            "pageNavigation",
            "|",
            "trackChanges",
            "comment",
            "commentsArchive",
            "|",
            "toggleAi",
            "aiQuickActions",
            "|",
            "formatPainter",
            "findAndReplace",
            "fullscreen",
            "|",
            "heading",
            "|",
            "fontSize",
            "fontFamily",
            "fontColor",
            "fontBackgroundColor",
            "|",
            "bold",
            "italic",
            "underline",
            "strikethrough",
            "subscript",
            "superscript",
            "code",
            "removeFormat",
            "|",
            "emoji",
            "specialCharacters",
            "horizontalLine",
            "pageBreak",
            "link",
            "insertFootnote",
            "bookmark",
            "insertImage",
            "insertImageViaUrl",
            "ckbox",
            "mediaEmbed",
            "insertTable",
            "tableOfContents",
            "blockQuote",
            "codeBlock",
            "|",
            "alignment",
            "lineHeight",
            "|",
            "bulletedList",
            "numberedList",
            "todoList",
            "outdent",
            "indent",
          ],
          shouldNotGroupWhenFull: false,
        },
        plugins: [
          AIChat,
          AIEditorIntegration,
          AIQuickActions,
          AIReviewMode,
          Alignment,
          Autoformat,
          AutoImage,
          AutoLink,
          Autosave,
          BalloonToolbar,
          BlockQuote,
          Bold,
          Bookmark,
          CKBox,
          CKBoxImageEdit,
          CloudServices,
          Code,
          CodeBlock,
          Comments,
          DocumentOutline,
          Emoji,
          Essentials,
          FindAndReplace,
          FontBackgroundColor,
          FontColor,
          FontFamily,
          FontSize,
          Footnotes,
          FormatPainter,
          Fullscreen,
          Heading,
          HorizontalLine,
          ImageBlock,
          ImageCaption,
          ImageInsert,
          ImageInsertViaUrl,
          ImageResize,
          ImageStyle,
          ImageToolbar,
          ImageUpload,
          Indent,
          IndentBlock,
          Italic,
          LineHeight,
          Link,
          LinkImage,
          List,
          ListProperties,
          MediaEmbed,
          Mention,
          Minimap,
          PageBreak,
          Pagination,
          Paragraph,
          PasteFromOffice,
          PasteFromOfficeEnhanced,
          PictureEditing,
          RemoveFormat,
          SlashCommand,
          SpecialCharacters,
          SpecialCharactersArrows,
          SpecialCharactersCurrency,
          SpecialCharactersEssentials,
          SpecialCharactersLatin,
          SpecialCharactersMathematical,
          SpecialCharactersText,
          Strikethrough,
          Subscript,
          Superscript,
          Table,
          TableCaption,
          TableCellProperties,
          TableColumnResize,
          TableOfContents,
          TableProperties,
          TableToolbar,
          TextTransformation,
          TodoList,
          TrackChanges,
          TrackChangesData,
          TrackChangesPreview,
          Underline,
        ],
        ai: {
          container: {
            type: "sidebar" as const,
            element: editorCkeditorAiRef.current,
            showResizeButton: false,
          },
          chat: {
            context: {
              document: { enabled: true },
              urls: { enabled: true },
              files: { enabled: true },
            },
            shortcuts: [],
          },
        },
        balloonToolbar: [
          "comment",
          "|",
          "aiQuickActions",
          "|",
          "bold",
          "italic",
          "|",
          "link",
          "insertImage",
          "|",
          "bulletedList",
          "numberedList",
        ],
        cloudServices: {
          tokenUrl: CLOUD_SERVICES_TOKEN_URL,
          webSocketUrl: CLOUD_SERVICES_WEBSOCKET_URL,
        },
        collaboration: {
          channelId: "news-editor-" + Math.random().toString(36).substring(7),
        },
        comments: {
          editorConfig: {
            extraPlugins: [Autoformat, Bold, Italic, List, Mention],
            mention: {
              feeds: [{ marker: "@", feed: [] }],
            },
          },
        },
        documentOutline: {
          container: editorOutlineRef.current,
        },
        fontBackgroundColor: {
          colorPicker: { format: "hex" as const },
          colors: DEFAULT_HEX_COLORS,
        },
        fontColor: {
          colorPicker: { format: "hex" as const },
          colors: DEFAULT_HEX_COLORS,
        },
        fontFamily: {
          supportAllValues: true,
        },
        fontSize: {
          options: [10, 12, 14, "default", 18, 20, 22],
          supportAllValues: true,
        },
        fullscreen: {
          onEnterCallback: (container: HTMLElement) =>
            container.classList.add(
              "editor-container",
              "editor-container_document-editor",
              "editor-container_include-outline",
              "editor-container_include-annotations",
              "editor-container_include-minimap",
              "editor-container_contains-wrapper",
              "editor-container_include-pagination",
              "editor-container_include-fullscreen",
              "main-container"
            ),
        },
        heading: {
          options: [
            { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
            { model: "heading1", view: "h1", title: "Heading 1", class: "ck-heading_heading1" },
            { model: "heading2", view: "h2", title: "Heading 2", class: "ck-heading_heading2" },
            { model: "heading3", view: "h3", title: "Heading 3", class: "ck-heading_heading3" },
            { model: "heading4", view: "h4", title: "Heading 4", class: "ck-heading_heading4" },
            { model: "heading5", view: "h5", title: "Heading 5", class: "ck-heading_heading5" },
            { model: "heading6", view: "h6", title: "Heading 6", class: "ck-heading_heading6" },
          ],
        },
        image: {
          toolbar: [
            "toggleImageCaption",
            "|",
            "imageStyle:alignBlockLeft",
            "imageStyle:block",
            "imageStyle:alignBlockRight",
            "|",
            "resizeImage",
            "|",
            "ckboxImageEdit",
          ],
          styles: {
            options: ["alignBlockLeft", "block", "alignBlockRight"],
          },
        },
        lineHeight: {
          supportAllValues: true,
        },
        link: {
          addTargetToExternalLinks: true,
          defaultProtocol: "https://",
          decorators: {
            toggleDownloadable: {
              mode: "manual" as const,
              label: "Downloadable",
              attributes: { download: "file" },
            },
          },
        },
        list: {
          properties: {
            styles: true,
            startIndex: true,
            reversed: true,
          },
        },
        menuBar: {
          isVisible: true,
        },
        mention: {
          feeds: [{ marker: "@", feed: [] }],
        },
        minimap: {
          container: editorMinimapRef.current,
          extraClasses: "editor-container_include-minimap ck-minimap__iframe-content",
        },
        pagination: {
          pageWidth: "21cm",
          pageHeight: "29.7cm",
          pageMargins: {
            top: "20mm",
            bottom: "20mm",
            right: "12mm",
            left: "12mm",
          },
        },
        placeholder: "Nhập nội dung tin tức tại đây...",
        initialData: value,
        sidebar: {
          container: editorAnnotationsRef.current,
        },
        table: {
          contentToolbar: [
            "tableColumn",
            "tableRow",
            "mergeTableCells",
            "tableProperties",
            "tableCellProperties",
          ],
        },
      },
    }
  }, [isLayoutReady])

  return (
    <div className="main-container">
      <div
        ref={editorContainerRef}
        className="editor-container editor-container_document-editor editor-container_include-outline editor-container_include-annotations editor-container_include-minimap editor-container_contains-wrapper editor-container_include-pagination editor-container_include-fullscreen"
      >
        <div className="editor-container__menu-bar" ref={editorMenuBarRef} />
        <div className="editor-container__toolbar" ref={editorToolbarRef} />
        <div className="editor-container__editable-wrapper">
          <div className="editor-container__editor-wrapper">
            <div className="editor-container__sidebar" ref={editorOutlineRef} />
            <div className="editor-container__editor">
              <div ref={editorRef}>
                {editorConfig && (
                  <CKEditor
                    key={isLayoutReady ? "news-editor-ready" : "news-editor-loading"}
                    onReady={(editor) => {
                      const toolbarEl = editor.ui.view.toolbar.element
                      const menuBarEl = editor.ui.view.menuBarView.element
                      if (editorToolbarRef.current && toolbarEl) {
                        editorToolbarRef.current.appendChild(toolbarEl)
                      }
                      if (editorMenuBarRef.current && menuBarEl) {
                        editorMenuBarRef.current.appendChild(menuBarEl)
                      }
                      try {
                        const annotations = editor.plugins.get("AnnotationsUIs") as {
                          switchTo: (mode: string) => void
                        }
                        annotations.switchTo("narrowSidebar")
                      } catch {
                        /* Comments / annotations UI not available */
                      }
                    }}
                    onAfterDestroy={() => {
                      if (editorToolbarRef.current) {
                        Array.from(editorToolbarRef.current.children).forEach((c) => c.remove())
                      }
                      if (editorMenuBarRef.current) {
                        Array.from(editorMenuBarRef.current.children).forEach((c) => c.remove())
                      }
                    }}
                    onChange={(_event, editor) => {
                      try {
                        onChange(editor.getData())
                      } catch (e) {
                        console.warn("CKEditor onChange:", e)
                      }
                    }}
                    onError={(error, { willEditorRestart }) => {
                      console.warn("CKEditor error:", error)
                      if (willEditorRestart) {
                        console.log("Editor will restart automatically")
                      }
                    }}
                    editor={DecoupledEditor}
                    config={editorConfig as never}
                  />
                )}
              </div>
            </div>
            <div
              className="editor-container__sidebar editor-container__sidebar_narrow"
              ref={editorAnnotationsRef}
            />
          </div>
          <div className="editor-container__sidebar editor-container__sidebar_minimap" ref={editorMinimapRef} />
          <div className="editor-container__sidebar_ckeditor-ai" ref={editorCkeditorAiRef} />
        </div>
      </div>
    </div>
  )
}
