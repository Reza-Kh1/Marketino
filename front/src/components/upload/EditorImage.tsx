import FilerobotImageEditor, { TABS, TOOLS } from "react-filerobot-image-editor";
import { StyleSheetManager } from "styled-components";
import isPropValid from "@emotion/is-prop-valid";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { FileProgress } from "./UploadMedia";

interface EditorImageType {
  editingFile: FileProgress | null
  setEditingFile: (value: FileProgress | null) => void
  handleSaveImage: (value: any) => void
}

function shouldForwardProp(propName: string, target: unknown) {
  if (typeof target === "string") {
    return isPropValid(propName);
  }
  return true;
}

const mediaData = {
  data: [
    {
      key: 'key'
    }
  ]
}
export default function EditorImage({ editingFile, setEditingFile, handleSaveImage }: EditorImageType) {
  // const { data: mediaData, isFetching } = useMedia({
  //   page: 1,
  //   order: 'desc',
  //   useCase: 'WATERMARK'
  // });


  const WATERMARK_GALLERY = mediaData?.data?.map((item) => `/remote-images${item.key.replace('images/WATERMARK', '')}`)
  return (
    <>
      {editingFile && (
        <div className="fixed inset-0 z-40 bg-black/60" aria-hidden="true" />
      )}

      <Dialog
        modal={false}
        open={!!editingFile}
        onOpenChange={(open) => !open && setEditingFile(null)}
      >
        <DialogContent
          showCloseButton={false}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onEscapeKeyDown={() => setEditingFile(null)}
          className="max-w-[95vw]! w-[95vw] h-[90vh] max-h-[90vh] p-1 bg-zinc-900 border-zinc-800 overflow-hidden text-white z-50"
        >
          {editingFile && (
            <div className="w-[95vw] h-[90vh]" dir="ltr">
              <StyleSheetManager shouldForwardProp={shouldForwardProp}>
                <FilerobotImageEditor
                  source={editingFile.originalSrc}
                  onSave={handleSaveImage}
                  onClose={() => setEditingFile(null)}
                  closeAfterSave={false}
                  avoidChangesNotSavedAlertOnLeave={false}
                  showBackButton={false}
                  defaultSavedImageName={editingFile.fileName.replace(/\.[^/.]+$/, "")}
                  defaultSavedImageType="webp"
                  defaultSavedImageQuality={0.92}
                  forceToPngInEllipticalCrop={true}
                  disableSaveIfNoChanges={false}
                  resetOnSourceChange={true}
                  // resetOnImageSourceChange={true}
                  useZoomPresetsMenu={true}
                  disableZooming={false}
                  observePluginContainerSize={true}
                  savingPixelRatio={1}
                  previewPixelRatio={1}
                  theme={{
                    typography: {
                      fontFamily: 'Tahoma, Vazirmatn, sans-serif, vazir',
                    },
                    objectStyles: {
                      borderRadius: '20px'
                    }
                  }}
                  annotationsCommon={{
                    fill: "#ff0000",
                  }}
                  Text={{
                    text: "متن خود را اینجا بنویسید",
                    fonts: [
                      { label: "Arial", value: "Arial" },
                      "Tahoma",
                      "Sans-serif",
                      "vazir",
                      { label: "Comic Sans", value: "Comic Sans MS" },
                    ],
                    fontSize: 24,
                    align: "center",
                  }}
                  Image={{
                    disableUpload: false,
                    gallery: [],
                  }}
                  Rect={{
                    cornerRadius: 0,
                  }}
                  Polygon={{
                    sides: 6,
                  }}
                  Pen={{
                    strokeWidth: 3,
                  }}
                  Line={{
                    strokeWidth: 2,
                  }}
                  Arrow={{
                    strokeWidth: 4,
                  }}
                  Rotate={{ angle: 90, componentType: "slider" }}
                  Watermark={{
                    gallery: WATERMARK_GALLERY,
                    textScalingRatio: 0.33,
                    imageScalingRatio: 0.33,
                    hideTextWatermark: false,
                  }}
                  Crop={{
                    minWidth: 20,
                    minHeight: 20,
                    noPresets: false,
                    autoResize: false,
                    presetsItems: [
                      {
                        titleKey: "classicTv",
                        descriptionKey: "4:3",
                        ratio: 4 / 3,
                      },
                      {
                        titleKey: "cinemascope",
                        descriptionKey: "21:9",
                        ratio: 21 / 9,
                      },
                    ],
                    presetsFolders: [
                      {
                        titleKey: "socialMedia",
                        groups: [
                          {
                            titleKey: "facebook",
                            items: [
                              {
                                titleKey: "profile",
                                width: 180,
                                height: 180,
                                descriptionKey: "fbProfileSize",
                              },
                              {
                                titleKey: "coverPhoto",
                                width: 820,
                                height: 312,
                                descriptionKey: "fbCoverPhotoSize",
                              },
                            ],
                          },
                          {
                            titleKey: "instagram",
                            items: [
                              {
                                titleKey: "post",
                                width: 1080,
                                height: 1080,
                                descriptionKey: "igPostSize",
                              },
                              {
                                titleKey: "story",
                                width: 1080,
                                height: 1920,
                                descriptionKey: "igStorySize",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  }}
                  language="en"
                  tabsIds={[
                    TABS.ADJUST,
                    TABS.FINETUNE,
                    TABS.FILTERS,
                    TABS.ANNOTATE,
                    TABS.WATERMARK,
                    TABS.RESIZE,
                    TABS.AI,
                  ]}
                  useBackendTranslations={false}
                  defaultTabId={TABS.ADJUST}
                  defaultToolId={TOOLS.CROP}
                />
              </StyleSheetManager>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
