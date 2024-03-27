import { Drawer, Grid, Typography } from "@mui/material";
import DatetimeInput from "components/DatetimeInput";
import SelectInput from "components/SelectInput";
import TextInput from "components/TextInput";
import dayjs from "dayjs";
import { useWorkflowsEditor } from "features/workflowEditor/context";
import {
  type EndDateTypes,
  type IWorkflowSettings,
  type ScheduleIntervals,
  type StorageSourcesAWS,
  type StorageSourcesLocal,
  type StartDateTypes,
  endDateTypes,
  startDateTypes,
  scheduleIntervals,
  storageSourcesAWS,
  storageSourcesLocal,
} from "features/workflowEditor/context/types";
import {
  useCallback,
  useEffect,
  forwardRef,
  useImperativeHandle,
  type ForwardedRef,
} from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { isEmpty, yupResolver } from "utils";
import * as yup from "yup";

interface ISettingsFormDrawerProps {
  open: boolean;
  onClose: (event: any) => void;
}

const defaultSettingsData: IWorkflowSettings = {
  config: {
    name: "",
    scheduleInterval: scheduleIntervals.None,
    startDate: dayjs(new Date()).toISOString(),
    endDateType: endDateTypes.Never,
    startDateType: startDateTypes.Now,
  },
  storage: {
    storageSource: storageSourcesLocal.None,
    baseFolder: "",
    bucket: "",
  },
};

const storageSourceOptions =
  import.meta.env.DOMINO_DEPLOY_MODE === "local-compose"
    ? [
        {
          label: "None",
          value: "None",
        },
        {
          label: "Local",
          value: "Local",
        },
      ]
    : [
        {
          label: "None",
          value: "None",
        },
        {
          label: "AWS S3",
          value: "AWS S3",
        },
      ];

type ValidationSchema = yup.ObjectSchema<IWorkflowSettings>;

// TODO check yup validation
export const WorkflowSettingsFormSchema: ValidationSchema = yup.object().shape({
  config: yup.object().shape({
    name: yup
      .string()
      .matches(/^[\w]*$/, "Name can only have letters and numbers.")
      .required(),
    scheduleInterval: yup
      .mixed<ScheduleIntervals>()
      .oneOf(Object.values(scheduleIntervals))
      .required(),
    startDate: yup.string(),
    endDate: yup.string(),
    endDateType: yup
      .mixed<EndDateTypes>()
      .oneOf(Object.values(endDateTypes))
      .required(),
    startDateType: yup
      .mixed<StartDateTypes>()
      .oneOf(Object.values(startDateTypes))
      .required(),
  }),
  storage: yup.object().shape({
    storageSource: yup.lazy((value) => {
      if (value === storageSourcesAWS.AWS_S3) {
        return yup
          .mixed<StorageSourcesAWS>()
          .oneOf(Object.values(storageSourcesAWS))
          .required();
      }
      return yup
        .mixed<StorageSourcesLocal>()
        .oneOf(Object.values(storageSourcesLocal))
        .required();
    }),
    baseFolder: yup.string(),
    bucket: yup.string(),
  }),
});

export interface SettingsFormDrawerRef {
  loadData: () => void;
}

const SettingsFormDrawer = forwardRef<
  SettingsFormDrawerRef,
  ISettingsFormDrawerProps
>(
  (
    props: ISettingsFormDrawerProps,
    ref: ForwardedRef<SettingsFormDrawerRef>,
  ) => {
    const { open, onClose } = props;

    const { getWorkflowSettingsData, setWorkflowSettingsData } =
      useWorkflowsEditor();

    const resolver = yupResolver(WorkflowSettingsFormSchema);
    const methods = useForm<IWorkflowSettings>({
      mode: "onChange",
      resolver,
      defaultValues: defaultSettingsData,
    });
    const formData = useWatch({ control: methods.control });

    const loadData = useCallback(() => {
      const data = getWorkflowSettingsData();
      if (isEmpty(data)) {
        methods.reset(defaultSettingsData);
        setWorkflowSettingsData(defaultSettingsData);
      } else {
        methods.reset(data);
      }
    }, [methods.reset, getWorkflowSettingsData, setWorkflowSettingsData]);

    const saveData = useCallback(() => {
      if (open && !isEmpty(formData)) {
        setWorkflowSettingsData(formData as any);
      }
    }, [formData, open, setWorkflowSettingsData]);

    useEffect(() => {
      loadData();
    }, [open, loadData]);

    useEffect(() => {
      saveData();
    }, [saveData]);

    useImperativeHandle(
      ref,
      () => {
        return {
          loadData,
        };
      },
      [loadData],
    );

    if (isEmpty(formData)) {
      return null;
    }

    return (
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        sx={{
          "& .MuiDrawer-paper": {
            marginTop: "4rem",
            width: "33%",
            maxWidth: "500px",
            minWidth: "300px",
          },
        }}
        BackdropProps={{ style: { backgroundColor: "transparent" } }}
      >
        <Grid container>
          <Grid container padding={1}>
            <Typography
              variant="h5"
              component="h5"
              sx={{ marginTop: "20px", marginBottom: "20px" }}
            >
              Settings
            </Typography>
            <FormProvider {...methods}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextInput
                    variant="outlined"
                    name="config.name"
                    label="Name"
                    defaultValue={defaultSettingsData.config.name}
                  />
                </Grid>
                <Grid item xs={12}>
                  <SelectInput
                    name="config.scheduleInterval"
                    defaultValue={defaultSettingsData.config.scheduleInterval}
                    options={Object.values(scheduleIntervals)}
                    label="Schedule"
                  />
                </Grid>
                <Grid
                  container
                  spacing={2}
                  alignItems="center"
                  sx={{ margin: "0px" }}
                >
                  <Grid item xs={4}>
                    <SelectInput
                      name="config.startDateType"
                      label="Start Date/Time"
                      options={Object.values(startDateTypes)}
                      defaultValue={defaultSettingsData.config.startDateType}
                    />
                  </Grid>
                  {formData?.config?.startDateType ===
                    startDateTypes.UserDefined && (
                    <Grid item xs={8}>
                      <DatetimeInput
                        disablePast={true}
                        name="config.startDate"
                        label="Start Date/Time"
                        type="date-time"
                      />
                    </Grid>
                  )}
                </Grid>
                <Grid
                  container
                  spacing={2}
                  alignItems="center"
                  sx={{ margin: "0px" }}
                >
                  <Grid item xs={4}>
                    <SelectInput
                      name="config.endDateType"
                      label="End Date/Time"
                      options={Object.values(endDateTypes)}
                      defaultValue={defaultSettingsData.config.endDateType}
                    />
                  </Grid>
                  {formData?.config?.endDateType ===
                    endDateTypes.UserDefined && (
                    <Grid item xs={8}>
                      <DatetimeInput
                        disablePast={true}
                        name="config.endDate"
                        label="End Date/Time"
                        type="date-time"
                      />
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </FormProvider>
          </Grid>
          <Grid container padding={1}>
            <Grid item xs={12}>
              <Typography
                variant="h5"
                component="h5"
                sx={{ marginTop: "20px", marginBottom: "20px" }}
              >
                Storage
              </Typography>
            </Grid>
            <FormProvider {...methods}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <SelectInput
                    label="Storage Source"
                    name="storage.storageSource"
                    options={storageSourceOptions}
                    defaultValue={defaultSettingsData.storage.storageSource}
                  />
                </Grid>
                {formData?.storage?.storageSource ===
                storageSourcesAWS.AWS_S3 ? (
                  <>
                    <Grid item xs={12}>
                      <TextInput
                        name="storage.bucket"
                        label="Bucket"
                        defaultValue={defaultSettingsData.storage.bucket}
                        required
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextInput
                        label="Base Folder"
                        defaultValue={defaultSettingsData.storage.baseFolder}
                        required
                        fullWidth
                        name="storage.baseFolder"
                      />
                    </Grid>
                  </>
                ) : null}
              </Grid>
            </FormProvider>
          </Grid>
        </Grid>
      </Drawer>
    );
  },
);
SettingsFormDrawer.displayName = "SettingsFormDrawer";
export { SettingsFormDrawer };
