import React, {useEffect, useState} from 'react';

import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import DatePicker from '@mui/lab/DatePicker';
import DateAdapter from '@mui/lab/AdapterDateFns';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

import { zhTW } from 'date-fns/locale';

import { AppSearchDataGrid } from './AppSearchDataGrid';
import { AppSearchCalculation } from './AppSearchCalculation';
import { cleanFormData } from './Utils';


const initialState = {
  filter: {
    species: [],
    startDate: null,
    endDate: null,
    projects: [{project: null}],
    keyword: '',
  },
  pagination: {
    page: 0,
    perPage: 10,
  },
  options: {
    species: [],
    projects: [],
    deploymentDict: null,
  },
  isLoading: false,
  result: null,
  calculation: {
    session: 'month',
    imageInterval: '60',
    eventInterval: '60',
    fileFormat: 'excel',
    calcType: 'basic',
  }
};

function reducer(state, action) {
  console.log(state,action);
  switch (action.type) {
  case 'startLoading':
    return {
      ...state,
      isLoading: true,
    };
  case 'stopLoading':
    return {
      ...state,
      isLoading: false,
    };
  case 'initOptions':
    return {
      ...state,
      options: {
        ...state.options,
        projects: action.value.projects,
        species: action.value.species,
      }
    };
  case 'setDeploymentOptions':
    return {
      ...state,
      options: {
        ...state.options,
        deploymentDict: action.value,
      },
      isLoading: false,
    }
  case 'setFilter':
    return {
      ...state,
      filter: {
        ...state.filter,
        [action.name]: action.value
      },
      pagination: {
        page: 0,
        perPage: state.pagination.perPage,
      }
    }
  case 'setResult':
    return {
      ...state,
      result: action.value,
      isLoading: false,
    }
  case 'setPagination':
    return {
      ...state,
      pagination: {
        page: action.page,
        perPage: action.perPage,
      }
    }
  default:
    //throw new Error();
    console.error('reducer errr!!!');
  }
}

const AppSearch = () => {
  const today = new Date();
  const todayYMD = `${today.getFullYear()}-${today.getMonth().toString().padStart(2, '0')}-${today.getDay().toString().padStart(2, '0')}`;
  //console.log(todayYMD);
  const apiPrefix = process.env.API_PREFIX;
  const [state, dispatch] = React.useReducer(reducer, initialState);

  useEffect(() => {
    fetch(`${apiPrefix}species`)
    .then(resp => resp.json())
    .then(data => {
      fetch(`${apiPrefix}projects`)
        .then(resp2 => resp2.json())
        .then(data2 => {
          dispatch({type: 'initOptions', value: {species: data.data, projects: data2.data}});
        });
    });
  }, []);

  useEffect(() => {
    if (state.pagination.page !== 0 || state.pagination.perPage !== 10) {
      // prevent first time fetch (not press submit button yet!)
      fetchData();
    }
  }, [state.pagination]);

  const fetchData = () => {
    const formDataCleaned = cleanFormData(state.filter);
    console.log('cleaned', formDataCleaned);
    //const csrftoken = getCookie('csrftoken');
    const d = JSON.stringify(formDataCleaned);
    let searchApiUrl = `${apiPrefix}search?filter=${d}`;

    const p1 = (state.pagination.perPage === 10) ? {page: 0, perPage: 20} : state.pagination;
    const p2 = JSON.stringify(p1);
    searchApiUrl = `${searchApiUrl}&pagination=${p2}`;

    dispatch({type: 'startLoading'});
    console.log('fetch:', searchApiUrl);
    fetch(encodeURI(searchApiUrl), {
      //body: JSON.stringify({filter: formData}),
      mode: 'same-origin',
      headers: {
        'content-type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest', // for Django request.is_ajax()
        //'X-CSRFToken': csrftoken,
      },
      method: 'GET',
    })
      .then(resp => resp.json())
      .then(data => {
        console.log('resp', data)
        dispatch({type: 'setResult', value: data});
      });
  };

  const fetchDeploymentList = (projectId) => {
    let studyareaApiUrl = `${apiPrefix}deployments?project_id=${projectId}`;

    dispatch({type: 'startLoading'});
    fetch(encodeURI(studyareaApiUrl), {
      //body: JSON.stringify({filter: formData}),
      mode: 'same-origin',
      headers: {
        'content-type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest', // for Django request.is_ajax()
        //'X-CSRFToken': csrftoken,
      },
      method: 'GET',
    })
      .then(resp => resp.json())
      .then(data => {
        //console.log('resp sa', data)
        let newDeploymentDict = state.options.deploymentDict || {};
        newDeploymentDict[projectId] = data.data;
        dispatch({type: 'setDeploymentOptions', value: newDeploymentDict});
      });
  };

  const handleSubmit = () => {
    fetchData();
  }

  const handleChangePage = (e, page) => {
    const pp = (state.pagination.perPage === 10) ? 20 : state.pagination.perPage;
    dispatch({type:'setPagination', page: page, perPage: pp});
  }

  const handleChangeRowsPerPage = (e) => {
    dispatch({type:'setPagination', page: 0, perPage: parseInt(e.target.value, 10)});
  }

  const handleCalc = () => {
    const formDataCleaned = cleanFormData(state.filter);
    const calc = JSON.stringify(state.calculation);
    const d = JSON.stringify(formDataCleaned);
    const searchApiUrl = `${apiPrefix}search?filter=${d}&calc=${calc}&download=1`;
    //setIsLoading(true);
    dispatch({type: 'startLoading'});
    console.log('fetch:', searchApiUrl);
    fetch(encodeURI(searchApiUrl), {
      //body: JSON.stringify({filter: formData}),
      mode: 'same-origin',
      headers: {
        'content-type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest', // for Django request.is_ajax()
        //'X-CSRFToken': csrftoken,
      },
      method: 'GET',
    })
      .then(resp => resp.blob())
      .then(blob => {
        const ext_name = (state.calculation.fileFormat === 'csv') ? 'csv' : 'xlsx';
        // code via: https://stackoverflow.com/a/65609170/644070
        const href = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.setAttribute('download', `camera-trap-calculation-${state.calculation.calcType}.${ext_name}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        //setIsLoading(false); TODO
      });
  }

  const ProjectFilterBox = ({index}) => {
    const projectId = (state.filter.projects[index].project) ? state.filter.projects[index].project.id : null;
    const studyareas = state.filter.projects[index].studyareas || [];
    let deploymentOptions = [];
    for (let i in studyareas) {
      const values = studyareas[i].deployments.map(x=> {x.groupBy = studyareas[i].name; return x});
      deploymentOptions = deploymentOptions.concat(values);
    }
    return (
      <Box sx={{ mt: 1}}>
        <Paper elevation={2} sx={{ p: 3}}>
          <Typography variant="subtitle1">計畫篩選 ({index+1})</Typography>
          <Grid container spacing={2}>
            <Grid item xs={10}>
              <Autocomplete
                options={state.options.projects}
                getOptionLabel={(option) => option.name}
                value={state.filter.projects[index].project || null}
                groupBy={(option)=> option.group_by}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    label="計畫名稱"
                  />
                )}
                onChange={(e, v) => {
                  if (v && v.id) {
                    const newArr = [...state.filter.projects];
                    newArr[index].project = v;
                    dispatch({type: 'setFilter', name: 'projects', value: newArr});
                    fetchDeploymentList(v.id);
                  }
                }}
              />
            </Grid>
            <Grid item xs={2} align="right">
              <Button startIcon={<RemoveCircleOutlineIcon/>} onClick={(e)=> {
                const newArr = [...state.filter.projects];
                if (newArr.length > 1) {
                  newArr.splice(index, 1);
                  dispatch({type: 'setFilter', name: 'projects', value: newArr});
                }
                }}>
                移除
              </Button>
            </Grid>
            {(state.filter.projects[index].project && state.options.deploymentDict && state.options.deploymentDict[projectId]) ?
             <Grid item xs={6}>
               <Autocomplete
                 multiple
                 options={state.options.deploymentDict[projectId]}
                 getOptionLabel={(option) => option.name}
                 value={state.filter.projects[index].studyareas || []}
                 renderInput={(params) => (
                   <TextField
                     {...params}
                     variant="standard"
                     label="樣區"
                   />
                 )}
                 onChange={(e, v) => {
                   const newArr = [...state.filter.projects];
                   newArr[index].studyareas = v;
                   newArr[index].deployments = [];
                   dispatch({type: 'setFilter', name: 'projects', value: newArr});
                 }}
               />
             </Grid>
             : null}
            {(state.filter.projects[index].project && state.options.deploymentDict && state.filter.projects[index].studyareas && state.filter.projects[index].studyareas) ?
             <Grid item xs={6}>
               <Autocomplete
                 multiple
                 options={deploymentOptions}
                 getOptionLabel={(option) => `${option.groupBy}: ${option.name}`}
                 value={state.filter.projects[index].deployments || []}
                 groupBy={(option)=> option.groupBy}
                 renderInput={(params) => (
                   <TextField
                     {...params}
                     variant="standard"
                     label="相機位置"
                   />
                 )}
                 onChange={(e, v) => {
                   const newArr = [...state.filter.projects];
                   newArr[index].deployments = v;
                   dispatch({type: 'setFilter', name: 'projects', value: newArr});
                 }}
               />
             </Grid>
             : null}
          </Grid>
        </Paper>
      </Box>
    );
  }

  console.log('state', state);

  return (
    <>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={state.isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <h3>篩選條件</h3>
      <LocalizationProvider dateAdapter={DateAdapter} locale={zhTW}>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Autocomplete
            multiple
            filterSelectedOptions
            options={state.options.species}
            getOptionLabel={(option) => option.name}
            value={state.filter.species}
            onChange={(e, value) => dispatch({type: 'setFilter', name: 'species', value: value})}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="standard"
                label="物種"
              />
            )}
          />
        </Grid>
        <Grid item xs={3}>
          <DatePicker
            disableFuture
            label="資料啟始日期"
            openTo="year"
            clearable={true}
            views={['year', 'month', 'day']}
            value={state.filter.startDate}
            inputFormat="yyyy-MM-dd"
            mask='____-__-__'
            onChange={(v) => dispatch({type: 'setFilter', name: 'startDate', value: v})}
            renderInput={(params) => <TextField {...params} variant="standard"/>}
          />
        </Grid>
        <Grid item xs={3}>
          <DatePicker
            disableFuture
            label="資料結束日期"
            clearable={true}
            openTo="year"
            views={['year', 'month', 'day']}
            value={state.filter.endDate}
            inputFormat="yyyy-MM-dd"
            mask='____-__-__'
            onChange={(v) => dispatch({type: 'setFilter', name: 'endDate', value: v})}
            renderInput={(params) => <TextField {...params} variant="standard" />}
          />
        </Grid>
        <Grid item xs={3}>
          <TextField
            label="計畫關鍵字"
            variant="standard"
            value={state.filter.keyword}
            onChange={(e)=> dispatch({type: 'setFilter', name: 'keyword', value: e.target.value})}
          />
        </Grid>
        <Grid item xs={3}>
          <Button variant="outlined" startIcon={<AddCircleOutlineIcon />} onClick={(e)=>dispatch({type:'setFilter', name: 'projects', value: [...state.filter.projects, {}]})}>
            新增計畫篩選
          </Button>
        </Grid>
        {state.filter.projects.map((x, index)=>
          <Grid item key={index} xs={12}>
            <ProjectFilterBox index={index}/>
          </Grid>
        )}

        <Grid item xs={3}>
          <Button variant="contained" onClick={handleSubmit}>搜尋</Button>
        </Grid>
        <Grid item xs={12}>
          {(state.result && state.result.data.length > 0) ?
           <>
           <AppSearchDataGrid result={state.result} handleChangePage={handleChangePage} handleChangeRowsPerPage={handleChangeRowsPerPage} pagination={state.pagination}/>
             <AppSearchCalculation calcData={state.calculation} setCalcData={state.calculation} />
           <Button variant="contained" onClick={handleCalc} style={{marginTop: '10px'}}>下載計算</Button>
             <div>
           <button type="button" className="btn btn-warning" data-bs-toggle="modal" data-bs-target="#exampleModal" style={{marginTop: '24px'}}>
                 計算項目說明
               </button>
             </div>
           </>
           : <h2>查無資料</h2>}
        </Grid>

      </Grid>
      </LocalizationProvider>
    </>
  );
}

export {AppSearch};
