"use client"

import * as React from "react"
import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu"
import { Select as WorkbookSelectPrimitive } from "@base-ui/react/select"
import type {
  XlsxContextMenuRenderProps,
  XlsxFormControlRenderProps,
  XlsxImageSelectionRenderProps,
} from "@extend-ai/react-xlsx"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@repo/design-system/lib/utils"
import { Button } from "@repo/design-system/components/ui/button"
import { Input } from "@repo/design-system/components/ui/input"
import { Check, ChevronRight, LoaderCircle, ChevronUp, ChevronDown } from "lucide-react"

export const WorkbookPopupContainer = React.createContext<HTMLElement | null>(
  null
)
const WorkbookControlsDisabled = React.createContext(false)
export const WorkbookDisabledControls = WorkbookControlsDisabled.Provider
export function WorkbookControlButton({
  primary,
  style,
  ...props
}: React.ComponentProps<typeof Button> & {
  primary?: boolean
}) {
  return (
    <Button
      type="button"
      variant={primary ? "default" : "outline"}
      size="sm"
      {...props}
      style={style}
    />
  )
}
export function WorkbookControlInput({
  label,
  value,
  onChange,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "value" | "onChange"> & {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const id = React.useId()
  return (
    <div className="grid min-w-0 gap-1.5">
      <label htmlFor={id} className="text-sm">
        {label}
      </label>
      <Input
        id={id}
        {...props}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
export function WorkbookControlSelect({
  label,
  value,
  options,
  onChange,
  placeholder,
  disabled,
}: {
  label: string
  value: string
  options: ReadonlyArray<readonly [string, string]>
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}) {
  const container = React.useContext(WorkbookPopupContainer)
  const inheritedDisabled = React.useContext(WorkbookControlsDisabled)
  const id = React.useId()
  return (
    <div className="grid min-w-0 gap-1.5">
      <label id={id} className="text-sm">
        {label}
      </label>
      <InlineWorkbookSelect
        value={value}
        disabled={disabled || inheritedDisabled}
        onValueChange={(next) => {
          if (next !== null) onChange(next)
        }}
        items={options.map(([value, label]) => ({ value, label }))}
      >
        <InlineWorkbookSelectTrigger
          aria-labelledby={id}
          size="sm"
          className="min-w-0"
        >
          <InlineWorkbookSelectValue placeholder={placeholder} />
        </InlineWorkbookSelectTrigger>
        <InlineSelectPopup portalProps={container ? { container } : undefined}>
          {options.map(([key, text]) => (
            <InlineWorkbookSelectItem key={key} value={key}>
              {text}
            </InlineWorkbookSelectItem>
          ))}
        </InlineSelectPopup>
      </InlineWorkbookSelect>
    </div>
  )
}
export function WorkbookControlCheck({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}) {
  return (
    <label className="flex min-w-0 items-start gap-2 py-1 text-sm">
      <input
        type="checkbox"
        className="mt-0.5 size-4 shrink-0 rounded border-input accent-primary focus-visible:outline-ring disabled:opacity-64"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="break-words">{label}</span>
    </label>
  )
}
function WorkbookMenuItems({
  actions,
  busy,
  runAction,
  container,
}: Pick<XlsxContextMenuRenderProps, "actions" | "busy" | "runAction"> & {
  container: HTMLElement
}) {
  return actions.map((action, index) => {
    const content = (
      <>
        {action.label}
        {action.shortcut ? (
          <InlineContextMenuShortcut>
            {action.shortcut}
          </InlineContextMenuShortcut>
        ) : null}
      </>
    )
    return (
      <React.Fragment key={action.id}>
        {action.separatorBefore && index > 0 ? (
          <InlineContextMenuSeparator />
        ) : null}
        {action.children?.length ? (
          <InlineContextMenuSub>
            <InlineContextMenuSubTrigger disabled={busy || action.disabled}>
              {content}
            </InlineContextMenuSubTrigger>
            <InlineContextMenuSubContent
              portalProps={{ container }}
              positionMethod="fixed"
              className="w-56"
              onKeyDown={(event) => event.stopPropagation()}
            >
              <WorkbookMenuItems
                actions={action.children}
                busy={busy}
                runAction={runAction}
                container={container}
              />
            </InlineContextMenuSubContent>
          </InlineContextMenuSub>
        ) : typeof action.checked === "boolean" ? (
          <InlineContextMenuCheckboxItem
            closeOnClick={false}
            checked={action.checked}
            disabled={busy || action.disabled}
            onClick={() => void runAction(action.id)}
          >
            {content}
          </InlineContextMenuCheckboxItem>
        ) : (
          <InlineContextMenuItem
            closeOnClick={false}
            disabled={busy || action.disabled}
            variant={action.destructive ? "destructive" : "default"}
            onClick={() => void runAction(action.id)}
          >
            {content}
          </InlineContextMenuItem>
        )}
      </React.Fragment>
    )
  })
}
function WorkbookContextMenu(props: XlsxContextMenuRenderProps) {
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null)
  return (
    <div
      ref={setContainer}
      className={props.isDark ? "dark" : undefined}
      style={{ width: 1, height: 1 }}
      onKeyDown={(event) => event.stopPropagation()}
    >
      {container ? (
        <InlineContextMenu
          open
          onOpenChange={(open) => {
            if (!open) props.closeMenu()
          }}
        >
          <InlineContextMenuContent
            anchor={container}
            positionMethod="fixed"
            portalProps={{ container }}
            finalFocus={false}
            side="bottom"
            sideOffset={0}
            align="start"
            className="w-56"
            onKeyDown={(event) => event.stopPropagation()}
          >
            <WorkbookMenuItems {...props} container={container} />
            {props.error ? (
              <p role="alert" className="max-w-72 p-2 text-sm text-destructive">
                {props.error}
              </p>
            ) : null}
          </InlineContextMenuContent>
        </InlineContextMenu>
      ) : null}
    </div>
  )
}
export function renderWorkbookContextMenu(props: XlsxContextMenuRenderProps) {
  return <WorkbookContextMenu {...props} />
}
export function renderWorkbookChartLoading() {
  return (
    <div
      role="status"
      className="flex size-full items-center justify-center gap-2 rounded-md border bg-muted/30 text-sm text-muted-foreground"
    >
      <InlineSpinner className="size-4" />
      <span>Loading chart…</span>
    </div>
  )
}
export function renderWorkbookImageSelection({
  getHandleProps,
}: XlsxImageSelectionRenderProps) {
  return (
    <>
      <div
        className="pointer-events-none absolute"
        style={{
          inset: 0,
          border: getHandleProps("nw").style.border,
        }}
      />
      {(["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const).map(
        (position) => {
          const props = getHandleProps(position)
          return (
            <div
              key={position}
              {...props}
              className="rounded-sm bg-background shadow-xs"
              style={{
                ...props.style,
                background: "var(--background)",
              }}
            />
          )
        }
      )}
    </>
  )
}
function WorkbookFormControl({
  control,
  checked,
  disabled,
  items,
  label,
  mixed,
  setSelected,
  setState,
  setValue,
  activate,
  style,
  stopPropagation,
}: XlsxFormControlRenderProps) {
  const caption = label || control.title || control.name || "Worksheet control"
  return (
    <div
      style={style}
      className="text-sm text-foreground"
      onPointerDown={stopPropagation}
      onClick={stopPropagation}
      onKeyDown={stopPropagation}
    >
      {control.kind === "button" ? (
        <Button
          variant="outline"
          className="size-full min-h-0"
          disabled={disabled}
          onClick={activate}
        >
          {caption}
        </Button>
      ) : control.kind === "checkbox" || control.kind === "radio" ? (
        <label className="flex size-full items-center gap-2">
          <input
            type={control.kind}
            aria-label={caption}
            disabled={disabled}
            checked={checked}
            ref={(node) => {
              if (node) node.indeterminate = mixed
            }}
            className="size-4 accent-primary"
            onChange={(event) =>
              setState(event.target.checked ? "checked" : "unchecked")
            }
          />
          <span className="truncate">{label}</span>
        </label>
      ) : control.kind === "dropdown" ? (
        <InlineWorkbookSelect
          disabled={disabled}
          value={
            typeof control.selected === "number"
              ? String(control.selected)
              : null
          }
          onValueChange={(value) =>
            setSelected(value == null ? undefined : Number(value))
          }
          items={items.map((label, index) => ({ value: String(index), label }))}
        >
          <InlineWorkbookSelectTrigger
            aria-label={caption}
            className="size-full min-h-0 min-w-0"
          >
            <InlineWorkbookSelectValue
              placeholder={label || "WorkbookSelect an item"}
            />
          </InlineWorkbookSelectTrigger>
          <InlineSelectPopup>
            {items.map((item, index) => (
              <InlineWorkbookSelectItem key={index} value={String(index)}>
                {item || "(blank)"}
              </InlineWorkbookSelectItem>
            ))}
          </InlineSelectPopup>
        </InlineWorkbookSelect>
      ) : control.kind === "listbox" ? (
        <select
          aria-label={caption}
          disabled={disabled}
          multiple={(control.selection ?? "single") !== "single"}
          value={
            (control.selection ?? "single") === "single"
              ? String(
                  typeof control.selected === "number" ? control.selected : -1
                )
              : (Array.isArray(control.selected)
                  ? control.selected
                  : typeof control.selected === "number"
                    ? [control.selected]
                    : []
                ).map(String)
          }
          className="size-full rounded-md border border-input bg-background p-1 text-sm outline-ring"
          onChange={(event) =>
            setSelected(
              (control.selection ?? "single") === "single"
                ? Number(event.target.value)
                : Array.from(event.target.selectedOptions, (item) =>
                    Number(item.value)
                  )
            )
          }
        >
          {items.map((item, index) => (
            <option key={index} value={index}>
              {item || "(blank)"}
            </option>
          ))}
        </select>
      ) : control.kind === "scrollbar" ? (
        <input
          aria-label={caption}
          type="range"
          disabled={disabled}
          min={control.min ?? 0}
          max={control.max ?? 100}
          step={control.increment ?? 1}
          value={control.value ?? control.min ?? 0}
          onChange={(event) => setValue(Number(event.target.value))}
          className="size-full accent-primary"
          style={
            control.horizontal === false
              ? { writingMode: "vertical-lr", direction: "rtl" }
              : undefined
          }
        />
      ) : control.kind === "spinner" ? (
        <Input
          aria-label={caption}
          type="number"
          disabled={disabled}
          min={control.min}
          max={control.max}
          step={control.increment ?? 1}
          value={control.value ?? 0}
          onChange={(event) => {
            if (
              event.target.value !== "" &&
              Number.isFinite(event.target.valueAsNumber)
            )
              setValue(event.target.valueAsNumber)
          }}
          className="size-full min-h-0"
        />
      ) : (
        <div
          className={cn(
            "size-full p-1",
            control.kind === "group-box" && "rounded-md border border-border"
          )}
        >
          {label}
        </div>
      )}
    </div>
  )
}
export function renderWorkbookFormControl(props: XlsxFormControlRenderProps) {
  return <WorkbookFormControl {...props} />
}
function InlineContextMenu({
  ...props
}: ContextMenuPrimitive.Root.Props): React.ReactElement {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />
}
function InlineContextMenuCheckboxItem({
  className,
  children,
  checked,
  variant = "default",
  ...props
}: ContextMenuPrimitive.CheckboxItem.Props & {
  variant?: "default" | "switch"
}): React.ReactElement {
  return (
    <ContextMenuPrimitive.CheckboxItem
      checked={checked}
      className={cn(
        "relative flex min-h-8 cursor-default items-center gap-2 rounded-sm py-1 pe-2 text-base outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground sm:min-h-7 sm:text-sm data-disabled:pointer-events-none data-disabled:opacity-64 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4",
        variant === "default" && "ps-8",
        variant === "switch" && "justify-between ps-2",
        className
      )}
      data-slot="context-menu-checkbox-item"
      data-variant={variant}
      {...props}
    >
      {variant === "switch" ? null : (
        <span className="pointer-events-none absolute start-2 flex size-4 items-center justify-center">
          <ContextMenuPrimitive.CheckboxItemIndicator>
            <Check
            />
          </ContextMenuPrimitive.CheckboxItemIndicator>
        </span>
      )}
      {children}
      {variant === "switch" ? (
        <span
          aria-hidden="true"
          className="pointer-events-none relative ms-4 inline-flex h-4 w-7 shrink-0 items-center rounded-full bg-input transition-colors data-[checked=true]:bg-primary"
          data-checked={checked ? "true" : "false"}
        >
          <span
            className="size-3 translate-x-0.5 rounded-full bg-background shadow-xs transition-transform data-[checked=true]:translate-x-3.5"
            data-checked={checked ? "true" : "false"}
          />
        </span>
      ) : null}
    </ContextMenuPrimitive.CheckboxItem>
  )
}
function InlineContextMenuContent({
  className,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset,
  anchor,
  positionMethod,
  portalProps,
  children,
  ...props
}: ContextMenuPrimitive.Popup.Props & {
  portalProps?: ContextMenuPrimitive.Portal.Props
  side?: ContextMenuPrimitive.Positioner.Props["side"]
  sideOffset?: ContextMenuPrimitive.Positioner.Props["sideOffset"]
  align?: ContextMenuPrimitive.Positioner.Props["align"]
  alignOffset?: ContextMenuPrimitive.Positioner.Props["alignOffset"]
  anchor?: ContextMenuPrimitive.Positioner.Props["anchor"]
  positionMethod?: ContextMenuPrimitive.Positioner.Props["positionMethod"]
}): React.ReactElement {
  return (
    <ContextMenuPrimitive.Portal {...portalProps}>
      <ContextMenuPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        positionMethod={positionMethod}
        className="z-50"
        data-slot="context-menu-positioner"
        side={side}
        sideOffset={sideOffset}
      >
        <ContextMenuPrimitive.Popup
          className={cn(
            "relative flex origin-(--transform-origin) rounded-lg border bg-popover text-popover-foreground shadow-lg/5 outline-none not-dark:bg-clip-padding not-[class*='w-']:min-w-32 before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] focus:outline-none dark:before:shadow-[0_-1px_--theme(--color-white/6%)]",
            className
          )}
          data-slot="context-menu-content"
          {...props}
        >
          <div
            className="max-h-(--available-height) w-full overflow-y-auto p-1"
            data-slot="context-menu-viewport"
          >
            {children}
          </div>
        </ContextMenuPrimitive.Popup>
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
  )
}
function InlineContextMenuItem({
  className,
  inset,
  variant = "default",
  asChild,
  children,
  render,
  ...props
}: ContextMenuPrimitive.Item.Props & {
  inset?: boolean
  variant?: "default" | "destructive"
  asChild?: boolean
}): React.ReactElement {
  return (
    <ContextMenuPrimitive.Item
      className={cn(
        "flex min-h-8 cursor-default items-center gap-2 rounded-sm px-2 py-1 text-base text-foreground outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-inset:ps-8 data-[variant=destructive]:text-destructive-foreground sm:min-h-7 sm:text-sm data-disabled:pointer-events-none data-disabled:opacity-64 [&>svg]:pointer-events-none [&>svg]:-mx-0.5 [&>svg]:shrink-0 [&>svg:not([class*='opacity-'])]:opacity-80 [&>svg:not([class*='size-'])]:size-4.5 sm:[&>svg:not([class*='size-'])]:size-4",
        className
      )}
      data-inset={inset}
      data-slot="context-menu-item"
      data-variant={variant}
      render={
        render ??
        (asChild && React.isValidElement(children)
          ? (children as React.ReactElement<Record<string, unknown>>)
          : undefined)
      }
      {...props}
    >
      {InlineChildContent(asChild, children)}
    </ContextMenuPrimitive.Item>
  )
}
function InlineChildContent(
  asChild: boolean | undefined,
  children: React.ReactNode
): React.ReactNode {
  return asChild && React.isValidElement(children) ? undefined : children
}
function InlineContextMenuSeparator({
  className,
  ...props
}: ContextMenuPrimitive.Separator.Props): React.ReactElement {
  return (
    <ContextMenuPrimitive.Separator
      className={cn("mx-2 my-1 h-px bg-border", className)}
      data-slot="context-menu-separator"
      {...props}
    />
  )
}
function InlineContextMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"kbd">): React.ReactElement {
  return (
    <kbd
      className={cn(
        "ms-auto font-sans text-xs font-medium tracking-widest text-muted-foreground/72",
        className
      )}
      data-slot="context-menu-shortcut"
      {...props}
    />
  )
}
function InlineContextMenuSub({
  ...props
}: ContextMenuPrimitive.SubmenuRoot.Props): React.ReactElement {
  return (
    <ContextMenuPrimitive.SubmenuRoot data-slot="context-menu-sub" {...props} />
  )
}
function InlineContextMenuSubContent(
  props: React.ComponentProps<typeof InlineContextMenuContent>
): React.ReactElement {
  return (
    <InlineContextMenuContent
      side="inline-end"
      sideOffset={0}
      align="start"
      alignOffset={-5}
      {...props}
    />
  )
}
function InlineContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: ContextMenuPrimitive.SubmenuTrigger.Props & {
  inset?: boolean
}): React.ReactElement {
  return (
    <ContextMenuPrimitive.SubmenuTrigger
      className={cn(
        "flex min-h-8 items-center gap-2 rounded-sm px-2 py-1 text-base text-foreground outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-inset:ps-8 data-popup-open:bg-accent data-popup-open:text-accent-foreground sm:min-h-7 sm:text-sm data-disabled:pointer-events-none data-disabled:opacity-64 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&>svg:not(:last-child)]:-mx-0.5",
        className
      )}
      data-inset={inset}
      data-slot="context-menu-sub-trigger"
      {...props}
    >
      {children}
      <ChevronRight className="ms-auto -me-0.5 opacity-80" />
    </ContextMenuPrimitive.SubmenuTrigger>
  )
}
function InlineSpinner({ className, ...props }: InlineRegistryIconProps) {
  return (
    <LoaderCircle role="status" aria-label="Loading" className={cn("size-4 animate-spin", className)} {...props} />
  )
}
type InlineRegistryIconProps = Omit<
  React.ComponentProps<"svg">,
  "children" | "strokeWidth"
> & { strokeWidth?: number }
const InlineWorkbookSelect: typeof WorkbookSelectPrimitive.Root =
  WorkbookSelectPrimitive.Root
function InlineSelectPopup({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "start",
  alignOffset = 0,
  alignItemWithTrigger = true,
  anchor,
  portalProps,
  ...props
}: WorkbookSelectPrimitive.Popup.Props & {
  portalProps?: WorkbookSelectPrimitive.Portal.Props
  side?: WorkbookSelectPrimitive.Positioner.Props["side"]
  sideOffset?: WorkbookSelectPrimitive.Positioner.Props["sideOffset"]
  align?: WorkbookSelectPrimitive.Positioner.Props["align"]
  alignOffset?: WorkbookSelectPrimitive.Positioner.Props["alignOffset"]
  alignItemWithTrigger?: WorkbookSelectPrimitive.Positioner.Props["alignItemWithTrigger"]
  anchor?: WorkbookSelectPrimitive.Positioner.Props["anchor"]
}): React.ReactElement {
  return (
    <WorkbookSelectPrimitive.Portal {...portalProps}>
      <WorkbookSelectPrimitive.Positioner
        align={align}
        alignItemWithTrigger={alignItemWithTrigger}
        alignOffset={alignOffset}
        anchor={anchor}
        className="z-50 select-none"
        data-slot="select-positioner"
        side={side}
        sideOffset={sideOffset}
      >
        <WorkbookSelectPrimitive.Popup
          className="origin-(--transform-origin) text-foreground outline-none"
          data-slot="select-popup"
          {...props}
        >
          <WorkbookSelectPrimitive.ScrollUpArrow
            className="top-0 z-50 flex h-6 w-full cursor-default items-center justify-center before:pointer-events-none before:absolute before:inset-x-px before:top-px before:h-[200%] before:rounded-t-[calc(var(--radius-lg)-1px)] before:bg-linear-to-b before:from-popover before:from-50%"
            data-slot="select-scroll-up-arrow"
          >
            <ChevronUp className="relative size-4.5 sm:size-4" />
          </WorkbookSelectPrimitive.ScrollUpArrow>
          <div className="relative h-full min-w-(--anchor-width) rounded-lg border bg-popover shadow-lg/5 not-dark:bg-clip-padding before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] dark:before:shadow-[0_-1px_--theme(--color-white/6%)]">
            <WorkbookSelectPrimitive.List
              className={cn(
                "max-h-(--available-height) overflow-y-auto p-1",
                className
              )}
              data-slot="select-list"
            >
              {children}
            </WorkbookSelectPrimitive.List>
          </div>
          <WorkbookSelectPrimitive.ScrollDownArrow
            className="bottom-0 z-50 flex h-6 w-full cursor-default items-center justify-center before:pointer-events-none before:absolute before:inset-x-px before:bottom-px before:h-[200%] before:rounded-b-[calc(var(--radius-lg)-1px)] before:bg-linear-to-t before:from-popover before:from-50%"
            data-slot="select-scroll-down-arrow"
          >
            <ChevronDown className="relative size-4.5 sm:size-4" />
          </WorkbookSelectPrimitive.ScrollDownArrow>
        </WorkbookSelectPrimitive.Popup>
      </WorkbookSelectPrimitive.Positioner>
    </WorkbookSelectPrimitive.Portal>
  )
}
function InlineWorkbookSelectItem({
  className,
  children,
  ...props
}: WorkbookSelectPrimitive.Item.Props): React.ReactElement {
  return (
    <WorkbookSelectPrimitive.Item
      className={cn(
        "grid min-h-8 cursor-default grid-cols-[1rem_1fr] items-center gap-2 rounded-sm py-1 ps-2 pe-4 text-base outline-none in-data-[side=none]:min-w-[calc(var(--anchor-width)+1.25rem)] data-highlighted:bg-accent data-highlighted:text-accent-foreground sm:min-h-7 sm:text-sm data-disabled:pointer-events-none data-disabled:opacity-64 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4",
        className
      )}
      data-slot="select-item"
      {...props}
    >
      <WorkbookSelectPrimitive.ItemIndicator className="col-start-1">
        <svg
          aria-hidden="true"
          fill="none"
          height="24"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5.252 12.7 10.2 18.63 18.748 5.37" />
        </svg>
      </WorkbookSelectPrimitive.ItemIndicator>
      <WorkbookSelectPrimitive.ItemText className="col-start-2 min-w-0">
        {children}
      </WorkbookSelectPrimitive.ItemText>
    </WorkbookSelectPrimitive.Item>
  )
}
function InlineWorkbookSelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: WorkbookSelectPrimitive.Trigger.Props &
  VariantProps<typeof InlineSelectTriggerVariants>): React.ReactElement {
  return (
    <WorkbookSelectPrimitive.Trigger
      className={cn(InlineSelectTriggerVariants({ size }), className)}
      data-slot="select-trigger"
      {...props}
    >
      {children}
      <WorkbookSelectPrimitive.Icon data-slot="select-icon">
        <ChevronDown className={InlineSelectTriggerIconClassName} />
      </WorkbookSelectPrimitive.Icon>
    </WorkbookSelectPrimitive.Trigger>
  )
}
const InlineSelectTriggerVariants = cva(
  "relative inline-flex min-h-9 w-full min-w-36 items-center justify-between gap-2 rounded-lg border border-input bg-background px-[calc(--spacing(3)-1px)] text-left text-base text-foreground shadow-xs/5 ring-ring/24 transition-shadow outline-none select-none not-dark:bg-clip-padding before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] not-data-disabled:not-focus-visible:not-aria-invalid:not-data-pressed:before:shadow-[0_1px_--theme(--color-black/4%)] focus-visible:border-ring focus-visible:ring-[3px] aria-invalid:border-destructive/36 focus-visible:aria-invalid:border-destructive/64 focus-visible:aria-invalid:ring-destructive/16 sm:min-h-8 sm:text-sm dark:bg-input/32 dark:not-data-disabled:not-focus-visible:not-aria-invalid:not-data-pressed:before:shadow-[0_-1px_--theme(--color-white/6%)] dark:aria-invalid:ring-destructive/24 pointer-coarse:after:absolute pointer-coarse:after:size-full pointer-coarse:after:min-h-11 data-disabled:pointer-events-none data-disabled:opacity-64 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='opacity-'])]:opacity-80 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [[data-disabled],:focus-visible,[aria-invalid],[data-pressed]]:shadow-none",
  {
    defaultVariants: {
      size: "default",
    },
    variants: {
      size: {
        default: "",
        lg: "min-h-10 sm:min-h-9",
        sm: "min-h-8 gap-1.5 px-[calc(--spacing(2.5)-1px)] sm:min-h-7",
      },
    },
  }
)
const InlineSelectTriggerIconClassName = "-me-1 size-4.5 opacity-80 sm:size-4"
function InlineWorkbookSelectValue({
  className,
  ...props
}: WorkbookSelectPrimitive.Value.Props): React.ReactElement {
  return (
    <WorkbookSelectPrimitive.Value
      className={cn(
        "flex-1 truncate data-placeholder:text-muted-foreground",
        className
      )}
      data-slot="select-value"
      {...props}
    />
  )
}
