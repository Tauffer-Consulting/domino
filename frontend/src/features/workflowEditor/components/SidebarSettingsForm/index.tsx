import { Drawer, Grid, Typography, TextField } from "@mui/material";
import DatetimeInput from "components/DatetimeInput";
import SelectInput from "components/SelectInput";
import TextInput from "components/TextInput";
import dayjs from "dayjs";
import {
  type EndDateTypes,
  type IWorkflowSettings,
  type ScheduleIntervals,
  type StorageSourcesAWS,
  type StorageSourcesLocal,
  endDateTypes,
  scheduleIntervals,
  storageSourcesAWS,
  storageSourcesLocal,
} from "features/workflowEditor/context/types/settings";
import { useWorkflowsEditor } from "features/workflowEditor/context/workflowsEditor";
import { useCallback, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "utils";
import * as yup from "yup";

interface ISidebarSettingsFormProps {
  open: boolean;
  onClose: (event: any) => void;
}

const defaultSettingsData: IWorkflowSettings = {
  config: {
    name: "",
    scheduleInterval: scheduleIntervals.None,
    startDate: dayjs(new Date()).toISOString(),
    endDateType: endDateTypes.Never,
  },
  storage: {
    storageSource: storageSourcesLocal.None,
    baseFolder: "",
    bucket: "",
  },
};

const storageSourceOptions =
  process.env.REACT_APP_DOMINO_DEPLOY_MODE === "local-compose"
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
          value: "AWSS3",
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
    startDate: yup.string().required(),
    endDate: yup.string(),
    endDateType: yup
      .mixed<EndDateTypes>()
      .oneOf(Object.values(endDateTypes))
      .required(),
  }),
  storage: yup.object().shape({
    storageSource: yup.lazy((value) => {
      if (value === storageSourcesAWS.AWSS3) {
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

const SidebarSettingsForm = (props: ISidebarSettingsFormProps) => {
  const { open, onClose } = props;

  const { fetchWorkflowSettingsData, setWorkflowSettingsData } =
    useWorkflowsEditor();

  const resolver = yupResolver(WorkflowSettingsFormSchema);
  const methods = useForm<IWorkflowSettings>({ mode: "onChange", resolver });
  const { register, watch, reset, trigger, getValues } = methods;
  const formData = watch();

  const [loaded, setLoaded] = useState(false);

  const validate = useCallback(() => {
    if (loaded) void trigger();
  }, [loaded, trigger]);

  useEffect(() => {
    validate();
  }, [validate]);

  const loadData = useCallback(async () => {
    const data = await fetchWorkflowSettingsData();
    if (Object.keys(data).length === 0) {
      reset(defaultSettingsData);
    } else {
      reset(data);
    }
    setLoaded(true);
  }, [reset, fetchWorkflowSettingsData]);

  const saveData = useCallback(async () => {
    if (open) {
      await setWorkflowSettingsData(formData);
    }
  }, [formData, open, setWorkflowSettingsData]);

  useEffect(() => {
    if (open) {
      void loadData();
    }
  }, [open, loadData]);

  useEffect(() => {
    void saveData();
  }, [saveData]);

  if (Object.keys(formData).length === 0) {
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
                  label="Schedule Interval"
                />
              </Grid>
              <Grid item xs={12}>
                <DatetimeInput
                  name="config.startDate"
                  label="Start Date/Time"
                  type="date-time"
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
                    name="config.endDateType"
                    label="End Date/Time"
                    options={Object.values(endDateTypes)}
                    defaultValue={defaultSettingsData.config.endDateType}
                  />
                </Grid>
                {getValues().config.endDateType ===
                  endDateTypes.UserDefined && (
                  <Grid item xs={8}>
                    <DatetimeInput
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
              {formData.storage.storageSource === storageSourcesAWS.AWSS3 ? (
                <>
                  <Grid item xs={12}>
                    <TextField
                      label="Bucket"
                      defaultValue={defaultSettingsData.storage.bucket}
                      required
                      fullWidth
                      {...register("storage.bucket")}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Base Folder"
                      defaultValue={defaultSettingsData.storage.baseFolder}
                      required
                      fullWidth
                      {...register("storage.baseFolder")}
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
};
export default SidebarSettingsForm;
